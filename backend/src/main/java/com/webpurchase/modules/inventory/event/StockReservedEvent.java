package com.webpurchase.modules.inventory.event;

import com.webpurchase.common.DomainEvent;

import java.time.Instant;

public record StockReservedEvent(
        Long skuId,
        String skuCode,
        int quantityReserved,
        int remainingAvailableStock,
        Instant occurredOn
) implements DomainEvent {

    public StockReservedEvent(Long skuId, String skuCode, int quantityReserved, int remainingAvailableStock) {
        this(skuId, skuCode, quantityReserved, remainingAvailableStock, Instant.now());
    }

    @Override
    public String eventType() {
        return "INVENTORY_STOCK_RESERVED";
    }
}
