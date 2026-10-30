package com.webpurchase.modules.catalog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpuResponse implements Serializable {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String slug;
    private String thumbnailUrl;
    private Map<String, Object> attributes;
    private String status;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer totalStock;
    private Instant createdAt;
}
