package com.webpurchase.modules.order.service;

import com.webpurchase.common.AppException;
import com.webpurchase.common.ErrorCode;
import com.webpurchase.config.RabbitMqConfig;
import com.webpurchase.modules.catalog.domain.entity.SkuVariant;
import com.webpurchase.modules.catalog.domain.repository.SkuVariantRepository;
import com.webpurchase.modules.iam.domain.entity.User;
import com.webpurchase.modules.iam.domain.repository.UserRepository;
import com.webpurchase.modules.inventory.service.InventoryService;
import com.webpurchase.modules.order.domain.entity.Order;
import com.webpurchase.modules.order.domain.entity.OrderItem;
import com.webpurchase.modules.order.domain.repository.OrderRepository;
import com.webpurchase.modules.order.dto.request.CreateOrderRequest;
import com.webpurchase.modules.order.dto.request.OrderItemRequest;
import com.webpurchase.modules.order.dto.response.OrderItemResponse;
import com.webpurchase.modules.order.dto.response.OrderResponse;
import com.webpurchase.modules.order.event.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final SkuVariantRepository skuVariantRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;
    private final ApplicationEventPublisher eventPublisher;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, String currentUsername) {
        log.info("Processing order placement for customer: {}", request.getCustomerEmail());

        User currentUser = null;
        if (currentUsername != null && !currentUsername.isBlank()) {
            currentUser = userRepository.findByUsername(currentUsername).orElse(null);
        }

        String orderCode = "ORD-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Order order = Order.builder()
                .orderCode(orderCode)
                .user(currentUser)
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .customerPhone(request.getCustomerPhone())
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "COD")
                .paymentStatus("UNPAID")
                .status("PENDING")
                .notes(request.getNotes())
                .items(new ArrayList<>())
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal runningTotal = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            SkuVariant sku = skuVariantRepository.findWithDetailsById(itemReq.getSkuId())
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND,
                            "SKU variant with ID " + itemReq.getSkuId() + " not found"));

            // 1. Concurrency-safe inventory reservation with optimistic locking retry
            inventoryService.reserveStockWithRetry(sku.getId(), itemReq.getQuantity());

            // 2. Build frozen variant_snapshot JSONB
            Map<String, Object> snapshot = new HashMap<>();
            snapshot.put("sku_id", sku.getId());
            snapshot.put("sku_code", sku.getSkuCode());
            snapshot.put("barcode", sku.getBarcode());
            snapshot.put("unit_price", sku.getPrice());
            snapshot.put("options", sku.getOptions());
            snapshot.put("image_url", sku.getImageUrl());
            if (sku.getSpu() != null) {
                snapshot.put("spu_id", sku.getSpu().getId());
                snapshot.put("spu_name", sku.getSpu().getName());
                snapshot.put("spu_slug", sku.getSpu().getSlug());
                snapshot.put("attributes", sku.getSpu().getAttributes());
            }

            BigDecimal unitPrice = sku.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            runningTotal = runningTotal.add(subtotal);

            OrderItem orderItem = OrderItem.builder()
                    .sku(sku)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .variantSnapshot(snapshot)
                    .build();

            order.addItem(orderItem);
        }

        order.setTotalAmount(runningTotal);
        Order savedOrder = orderRepository.save(order);

        log.info("Order placed successfully. OrderCode={}, TotalAmount={}", savedOrder.getOrderCode(), savedOrder.getTotalAmount());

        // 3. Publish internal Spring Application Event for synchronous/asynchronous module decoupled handling
        OrderCreatedEvent event = new OrderCreatedEvent(
                savedOrder.getId(),
                savedOrder.getOrderCode(),
                savedOrder.getCustomerName(),
                savedOrder.getTotalAmount(),
                savedOrder.getItems().size()
        );
        eventPublisher.publishEvent(event);

        // 4. Publish to RabbitMQ Topic Exchange for async external notification brokers
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMqConfig.EXCHANGE_ORDER,
                    RabbitMqConfig.ROUTING_KEY_ORDER_CREATED,
                    event
            );
        } catch (Exception e) {
            log.warn("RabbitMQ publish failed (Broker might be offline in development): {}", e.getMessage());
        }

        return mapToOrderResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByCode(String orderCode) {
        Order order = orderRepository.findWithItemsByOrderCode(orderCode)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND, "Order not found with code: " + orderCode));
        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        Page<Order> page = orderRepository.findAll(pageable);
        List<OrderResponse> content = page.getContent().stream().map(this::mapToOrderResponse).toList();
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findWithItemsById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        String oldStatus = order.getStatus();
        order.setStatus(newStatus);

        // If transitioning to DELIVERED or PAID, permanently deduct stock
        if ("DELIVERED".equalsIgnoreCase(newStatus) || "PAID".equalsIgnoreCase(newStatus)) {
            for (OrderItem item : order.getItems()) {
                if (item.getSku() != null) {
                    inventoryService.deductReservedStock(item.getSku().getId(), item.getQuantity());
                }
            }
        } else if ("CANCELLED".equalsIgnoreCase(newStatus) && !"CANCELLED".equalsIgnoreCase(oldStatus)) {
            // Release reservations
            for (OrderItem item : order.getItems()) {
                if (item.getSku() != null) {
                    inventoryService.releaseReservedStock(item.getSku().getId(), item.getQuantity());
                }
            }
        }

        Order updated = orderRepository.save(order);
        return mapToOrderResponse(updated);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems() != null
                ? order.getItems().stream().map(item -> OrderItemResponse.builder()
                .id(item.getId())
                .skuId(item.getSku() != null ? item.getSku().getId() : null)
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .variantSnapshot(item.getVariantSnapshot())
                .build()).toList()
                : List.of();

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .customerName(order.getCustomerName())
                .customerEmail(order.getCustomerEmail())
                .customerPhone(order.getCustomerPhone())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}
