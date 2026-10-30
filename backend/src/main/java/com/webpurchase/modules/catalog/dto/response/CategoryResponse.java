package com.webpurchase.modules.catalog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse implements Serializable {

    private Long id;
    private Long parentId;
    private String name;
    private String slug;
    private List<Map<String, Object>> attributeSchema;
    private Integer level;
    private Integer sortOrder;
    private boolean active;

    @Builder.Default
    private List<CategoryResponse> children = new ArrayList<>();
}
