package com.webpurchase.modules.catalog.service;

import com.webpurchase.common.AppException;
import com.webpurchase.common.ErrorCode;
import com.webpurchase.modules.catalog.domain.entity.Category;
import com.webpurchase.modules.catalog.domain.repository.CategoryRepository;
import com.webpurchase.modules.catalog.dto.request.CategoryRequest;
import com.webpurchase.modules.catalog.dto.response.CategoryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    /**
     * Retrieves the entire multi-level recursive category tree.
     * Cached in Redis for lightning-fast Storefront Mega Menu delivery.
     */
    @Cacheable(value = "categories_tree", key = "'all'")
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoryTree() {
        log.info("Fetching category tree from Database (Cache miss)");
        List<Category> rootCategories = categoryRepository.findByParentIsNullAndActiveTrueOrderBySortOrderAsc();
        return rootCategories.stream().map(this::mapToTreeResponse).toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND, "Category not found with slug: " + slug));
        return mapToTreeResponse(category);
    }

    @CacheEvict(value = "categories_tree", allEntries = true)
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new AppException(ErrorCode.CATEGORY_NAME_EXISTED, "Category slug already exists: " + request.getSlug());
        }

        Category parent = null;
        int level = 1;

        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND, "Parent category not found"));
            level = parent.getLevel() + 1;
        }

        Category category = Category.builder()
                .parent(parent)
                .name(request.getName())
                .slug(request.getSlug())
                .attributeSchema(request.getAttributeSchema() != null ? request.getAttributeSchema() : new ArrayList<>())
                .level(level)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Category saved = categoryRepository.save(category);
        return mapToTreeResponse(saved);
    }

    @CacheEvict(value = "categories_tree", allEntries = true)
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if (!category.getSlug().equals(request.getSlug()) && categoryRepository.existsBySlug(request.getSlug())) {
            throw new AppException(ErrorCode.CATEGORY_NAME_EXISTED, "Category slug already exists");
        }

        if (request.getParentId() != null && !request.getParentId().equals(category.getParent() != null ? category.getParent().getId() : null)) {
            Category newParent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND, "Parent category not found"));
            category.setParent(newParent);
            category.setLevel(newParent.getLevel() + 1);
        } else if (request.getParentId() == null) {
            category.setParent(null);
            category.setLevel(1);
        }

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        if (request.getAttributeSchema() != null) {
            category.setAttributeSchema(request.getAttributeSchema());
        }
        if (request.getSortOrder() != null) {
            category.setSortOrder(request.getSortOrder());
        }
        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }

        Category updated = categoryRepository.save(category);
        return mapToTreeResponse(updated);
    }

    private CategoryResponse mapToTreeResponse(Category category) {
        List<CategoryResponse> children = category.getChildren() != null
                ? category.getChildren().stream()
                .filter(Category::isActive)
                .map(this::mapToTreeResponse)
                .toList()
                : new ArrayList<>();

        return CategoryResponse.builder()
                .id(category.getId())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .name(category.getName())
                .slug(category.getSlug())
                .attributeSchema(category.getAttributeSchema())
                .level(category.getLevel())
                .sortOrder(category.getSortOrder())
                .active(category.isActive())
                .children(children)
                .build();
    }
}
