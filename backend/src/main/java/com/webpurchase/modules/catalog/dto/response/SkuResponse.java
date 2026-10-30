package com.webpurchase.modules.catalog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkuResponse implements Serializable {

    private Long id;
    private Long spuId;
    private String skuCode;
    private String barcode;
    private BigDecimal price;
    private BigDecimal compareAtPrice;
    private Map<String, Object> options;
    private String imageUrl;
    private boolean active;
    private Integer stockOnHand;
    private Integer stockReserved;
    private Integer availableStock;
}
