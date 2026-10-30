package com.webpurchase.modules.catalog.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpuCreateRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Product slug is required")
    private String slug;

    private String description;

    private String thumbnailUrl;

    @NotNull(message = "Attributes JSON is required")
    private Map<String, Object> attributes;

    @Valid
    @NotEmpty(message = "Product must have at least one SKU variant")
    private List<SkuCreateRequest> variants;
}
