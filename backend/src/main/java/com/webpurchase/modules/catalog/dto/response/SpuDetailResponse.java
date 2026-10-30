package com.webpurchase.modules.catalog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpuDetailResponse implements Serializable {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private String name;
    private String slug;
    private String description;
    private String thumbnailUrl;
    private Map<String, Object> attributes;
    private String status;
    private Instant createdAt;

    @Builder.Default
    private List<SkuResponse> variants = new ArrayList<>();
}
