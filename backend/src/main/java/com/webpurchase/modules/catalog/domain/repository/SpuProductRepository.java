package com.webpurchase.modules.catalog.domain.repository;

import com.webpurchase.modules.catalog.domain.entity.SpuProduct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpuProductRepository extends JpaRepository<SpuProduct, Long> {

    @EntityGraph(attributePaths = {"category", "variants", "variants.inventoryItem"})
    Optional<SpuProduct> findWithDetailsBySlug(String slug);

    @EntityGraph(attributePaths = {"category", "variants", "variants.inventoryItem"})
    Optional<SpuProduct> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"category", "variants"})
    Page<SpuProduct> findByStatus(String status, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "variants"})
    Page<SpuProduct> findByCategoryIdAndStatus(Long categoryId, String status, Pageable pageable);

    @Query(value = """
            SELECT sp.* FROM spu_products sp
            WHERE sp.status = 'ACTIVE'
              AND (
                  LOWER(sp.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                  OR LOWER(sp.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            ORDER BY sp.created_at DESC
            LIMIT 10
            """, nativeQuery = true)
    List<SpuProduct> searchSuggest(@Param("keyword") String keyword);

    /**
     * High-speed dynamic filter query utilizing PostgreSQL GIN Index on JSONB attributes.
     */
    @Query(value = """
            SELECT sp.* FROM spu_products sp
            WHERE sp.status = 'ACTIVE'
              AND (:categoryId IS NULL OR sp.category_id = :categoryId)
              AND (:jsonFilter IS NULL OR sp.attributes @> CAST(:jsonFilter AS jsonb))
            ORDER BY sp.created_at DESC
            """,
            countQuery = """
            SELECT COUNT(*) FROM spu_products sp
            WHERE sp.status = 'ACTIVE'
              AND (:categoryId IS NULL OR sp.category_id = :categoryId)
              AND (:jsonFilter IS NULL OR sp.attributes @> CAST(:jsonFilter AS jsonb))
            """,
            nativeQuery = true)
    Page<SpuProduct> findByDynamicJsonFilter(
            @Param("categoryId") Long categoryId,
            @Param("jsonFilter") String jsonFilter,
            Pageable pageable
    );

    boolean existsBySlug(String slug);
}
