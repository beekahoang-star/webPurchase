package com.webpurchase.modules.catalog.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkuCreateRequest {

    @NotBlank(message = "SKU code is required")
    private String skuCode;

    private String barcode;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Price must be non-negative")
    private BigDecimal price;

    private BigDecimal compareAtPrice;

    @NotNull(message = "Options JSON is required")
    private Map<String, Object> options;

    private String imageUrl;

    private Integer initialStock;
}
