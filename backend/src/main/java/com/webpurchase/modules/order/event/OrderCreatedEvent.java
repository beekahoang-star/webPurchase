package com.webpurchase.modules.order.event;

import com.webpurchase.common.DomainEvent;

import java.math.BigDecimal;
import java.time.Instant;

public record OrderCreatedEvent(
        Long orderId,
        String orderCode,
        String customerName,
        BigDecimal totalAmount,
        int totalItems,
        Instant occurredOn
) implements DomainEvent {

    public OrderCreatedEvent(Long orderId, String orderCode, String customerName, BigDecimal totalAmount, int totalItems) {
        this(orderId, orderCode, customerName, totalAmount, totalItems, Instant.now());
    }

    @Override
    public String eventType() {
        return "ORDER_CREATED";
    }
}
