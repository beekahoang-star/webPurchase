package com.webpurchase.modules.order.controller;

import com.webpurchase.common.ApiResponse;
import com.webpurchase.modules.order.dto.request.CreateOrderRequest;
import com.webpurchase.modules.order.dto.response.OrderResponse;
import com.webpurchase.modules.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order processing with frozen variant_snapshot and inventory reservation")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/orders")
    @Operation(summary = "Place order (Storefront checkout with optimistic inventory locking)")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : null;
        OrderResponse response = orderService.createOrder(request, username);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully", response));
    }

    @GetMapping("/orders/{orderCode}")
    @Operation(summary = "Get order details and preserved snapshot by order code")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByCode(@PathVariable String orderCode) {
        OrderResponse response = orderService.getOrderByCode(orderCode);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/admin/orders")
    @PreAuthorize("hasAuthority('ORDER_READ')")
    @Operation(summary = "List all orders (Admin/Manager with RBAC)")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        String[] sortParts = sort.split(",");
        String property = sortParts[0];
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, property));
        Page<OrderResponse> orders = orderService.getAllOrders(pageRequest);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PatchMapping("/admin/orders/{id}/status")
    @PreAuthorize("hasAuthority('ORDER_WRITE')")
    @Operation(summary = "Update order status (Triggers stock deduction/release)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusBody) {
        String newStatus = statusBody.get("status");
        OrderResponse response = orderService.updateOrderStatus(id, newStatus);
        return ResponseEntity.ok(ApiResponse.success("Order status updated to " + newStatus, response));
    }
}
