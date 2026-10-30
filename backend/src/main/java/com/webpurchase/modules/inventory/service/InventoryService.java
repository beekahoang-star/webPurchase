package com.webpurchase.modules.inventory.service;

import com.webpurchase.common.AppException;
import com.webpurchase.common.ErrorCode;
import com.webpurchase.modules.inventory.domain.entity.InventoryItem;
import com.webpurchase.modules.inventory.domain.repository.InventoryRepository;
import com.webpurchase.modules.inventory.event.StockDeductedEvent;
import com.webpurchase.modules.inventory.event.StockReservedEvent;
import jakarta.persistence.OptimisticLockException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private static final int MAX_OPTIMISTIC_RETRIES = 3;
    private static final long RETRY_BACKOFF_MS = 50;

    private final InventoryRepository inventoryRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Reserves stock with Optimistic Locking retry mechanism to prevent overselling and race conditions.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void reserveStockWithRetry(Long skuId, int quantity) {
        int attempts = 0;
        while (attempts < MAX_OPTIMISTIC_RETRIES) {
            try {
                attempts++;
                reserveStockInternal(skuId, quantity);
                return;
            } catch (OptimisticLockException | ObjectOptimisticLockingFailureException ex) {
                log.warn("Optimistic lock conflict on SKU id={} during attempt {}/{}. Retrying...",
                        skuId, attempts, MAX_OPTIMISTIC_RETRIES);
                if (attempts >= MAX_OPTIMISTIC_RETRIES) {
                    throw new AppException(ErrorCode.INVENTORY_RACE_CONDITION,
                            "High concurrency detected for SKU id " + skuId + ". Please retry.");
                }
                try {
                    Thread.sleep(RETRY_BACKOFF_MS * attempts);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Thread interrupted during lock retry");
                }
            }
        }
    }

    private void reserveStockInternal(Long skuId, int quantity) {
        InventoryItem item = inventoryRepository.findBySkuId(skuId)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND, "No inventory record for SKU " + skuId));

        int available = item.getAvailableStock();
        if (available < quantity) {
            log.error("Stock check failed: SKU id={}, Available={}, Requested={}", skuId, available, quantity);
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK,
                    String.format("Available stock (%d) is insufficient for requested quantity (%d)", available, quantity));
        }

        item.setStockReserved(item.getStockReserved() + quantity);
        inventoryRepository.saveAndFlush(item);

        log.info("Reserved {} units for SKU id={}. New reserved={}, Version={}",
                quantity, skuId, item.getStockReserved(), item.getVersion());

        eventPublisher.publishEvent(new StockReservedEvent(
                skuId,
                item.getSku() != null ? item.getSku().getSkuCode() : "SKU-" + skuId,
                quantity,
                item.getAvailableStock()
        ));
    }

    @Transactional
    public void deductReservedStock(Long skuId, int quantity) {
        InventoryItem item = inventoryRepository.findBySkuId(skuId)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

        item.setStockOnHand(item.getStockOnHand() - quantity);
        item.setStockReserved(item.getStockReserved() - quantity);
        inventoryRepository.save(item);

        log.info("Deducted {} units from on-hand and reserved for SKU id={}. OnHand Left={}",
                quantity, skuId, item.getStockOnHand());

        eventPublisher.publishEvent(new StockDeductedEvent(
                skuId,
                item.getSku() != null ? item.getSku().getSkuCode() : "SKU-" + skuId,
                quantity,
                item.getStockOnHand()
        ));
    }

    @Transactional
    public void releaseReservedStock(Long skuId, int quantity) {
        InventoryItem item = inventoryRepository.findBySkuId(skuId)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

        int newReserved = Math.max(0, item.getStockReserved() - quantity);
        item.setStockReserved(newReserved);
        inventoryRepository.save(item);

        log.info("Released {} reserved units for SKU id={}. Reserved remaining={}",
                quantity, skuId, item.getStockReserved());
    }
}
