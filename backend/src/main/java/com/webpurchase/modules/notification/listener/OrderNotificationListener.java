package com.webpurchase.modules.notification.listener;

import com.webpurchase.modules.notification.service.SseNotificationService;
import com.webpurchase.modules.order.event.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderNotificationListener {

    private final SseNotificationService sseNotificationService;

    @Async
    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Received internal OrderCreatedEvent for order: {}", event.orderCode());

        Map<String, Object> payload = Map.of(
                "type", "NEW_ORDER",
                "orderId", event.orderId(),
                "orderCode", event.orderCode(),
                "customerName", event.customerName(),
                "totalAmount", event.totalAmount(),
                "timestamp", event.occurredOn().toString()
        );

        sseNotificationService.broadcast("ORDER_ALERT", payload);
    }
}
