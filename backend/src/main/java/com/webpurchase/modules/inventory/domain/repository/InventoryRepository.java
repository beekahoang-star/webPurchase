package com.webpurchase.modules.inventory.domain.repository;

import com.webpurchase.modules.inventory.domain.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {

    Optional<InventoryItem> findBySkuId(Long skuId);

    @Query("SELECT i FROM InventoryItem i JOIN FETCH i.sku s JOIN FETCH s.spu WHERE i.sku.id = :skuId")
    Optional<InventoryItem> findWithSkuDetailsBySkuId(@Param("skuId") Long skuId);
}
