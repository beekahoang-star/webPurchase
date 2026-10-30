package com.webpurchase.modules.inventory.event;

import com.webpurchase.common.DomainEvent;

import java.time.Instant;

public record StockDeductedEvent(
        Long skuId,
        String skuCode,
        int quantityDeducted,
        int stockOnHandLeft,
        Instant occurredOn
) implements DomainEvent {

    public StockDeductedEvent(Long skuId, String skuCode, int quantityDeducted, int stockOnHandLeft) {
        this(skuId, skuCode, quantityDeducted, stockOnHandLeft, Instant.now());
    }

    @Override
    public String eventType() {
        return "INVENTORY_STOCK_DEDUCTED";
    }
}
