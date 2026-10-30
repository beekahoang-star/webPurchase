package com.webpurchase.modules.catalog.domain.repository;

import com.webpurchase.modules.catalog.domain.entity.SkuVariant;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SkuVariantRepository extends JpaRepository<SkuVariant, Long> {

    @EntityGraph(attributePaths = {"spu", "inventoryItem"})
    Optional<SkuVariant> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"spu", "inventoryItem"})
    Optional<SkuVariant> findWithDetailsBySkuCode(String skuCode);

    boolean existsBySkuCode(String skuCode);
}
