package com.webpurchase.modules.inventory.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.webpurchase.common.BaseEntity;
import com.webpurchase.modules.catalog.domain.entity.SkuVariant;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "inventory_items")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sku_id", nullable = false, unique = true)
    @JsonIgnore
    private SkuVariant sku;

    @Column(name = "stock_on_hand", nullable = false)
    @Builder.Default
    private Integer stockOnHand = 0;

    @Column(name = "stock_reserved", nullable = false)
    @Builder.Default
    private Integer stockReserved = 0;

    /**
     * Optimistic locking version field.
     * Prevents race conditions and overselling during concurrent stock reservations/deductions.
     */
    @Version
    @Column(nullable = false)
    private Long version;

    public int getAvailableStock() {
        return Math.max(0, stockOnHand - stockReserved);
    }
}
