package com.webpurchase.modules.catalog.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webpurchase.common.AppException;
import com.webpurchase.common.ErrorCode;
import com.webpurchase.modules.catalog.domain.entity.Category;
import com.webpurchase.modules.catalog.domain.entity.SkuVariant;
import com.webpurchase.modules.catalog.domain.entity.SpuProduct;
import com.webpurchase.modules.catalog.domain.repository.CategoryRepository;
import com.webpurchase.modules.catalog.domain.repository.SkuVariantRepository;
import com.webpurchase.modules.catalog.domain.repository.SpuProductRepository;
import com.webpurchase.modules.catalog.dto.request.SkuCreateRequest;
import com.webpurchase.modules.catalog.dto.request.SpuCreateRequest;
import com.webpurchase.modules.catalog.dto.response.SkuResponse;
import com.webpurchase.modules.catalog.dto.response.SpuDetailResponse;
import com.webpurchase.modules.catalog.dto.response.SpuResponse;
import com.webpurchase.modules.inventory.domain.entity.InventoryItem;
import com.webpurchase.modules.inventory.domain.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final SpuProductRepository spuRepository;
    private final SkuVariantRepository skuRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Page<SpuResponse> getProducts(Long categoryId, Map<String, Object> dynamicFilters, Pageable pageable) {
        if (dynamicFilters != null && !dynamicFilters.isEmpty()) {
            try {
                String jsonFilter = objectMapper.writeValueAsString(dynamicFilters);
                Page<SpuProduct> spuPage = spuRepository.findByDynamicJsonFilter(categoryId, jsonFilter, pageable);
                List<SpuResponse> content = spuPage.getContent().stream().map(this::mapToSummaryResponse).toList();
                return new PageImpl<>(content, pageable, spuPage.getTotalElements());
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize dynamic filters to JSONB: {}", e.getMessage());
                throw new AppException(ErrorCode.VALIDATION_FAILED, "Invalid dynamic JSON filter");
            }
        }

        Page<SpuProduct> spuPage;
        if (categoryId != null) {
            spuPage = spuRepository.findByCategoryIdAndStatus(categoryId, "ACTIVE", pageable);
        } else {
            spuPage = spuRepository.findByStatus("ACTIVE", pageable);
        }

        List<SpuResponse> content = spuPage.getContent().stream().map(this::mapToSummaryResponse).toList();
        return new PageImpl<>(content, pageable, spuPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public List<SpuResponse> searchSuggest(String keyword) {
        if (keyword == null || keyword.trim().length() < 2) {
            return List.of();
        }
        return spuRepository.searchSuggest(keyword.trim()).stream()
                .map(this::mapToSummaryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SpuDetailResponse getProductBySlug(String slug) {
        SpuProduct spu = spuRepository.findWithDetailsBySlug(slug)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found with slug: " + slug));

        return mapToDetailResponse(spu);
    }

    @Transactional(readOnly = true)
    public SpuDetailResponse getProductById(Long id) {
        SpuProduct spu = spuRepository.findWithDetailsById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found with id: " + id));

        return mapToDetailResponse(spu);
    }

    @Transactional
    public SpuDetailResponse createProduct(SpuCreateRequest request) {
        if (spuRepository.existsBySlug(request.getSlug())) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Product slug already exists: " + request.getSlug());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        SpuProduct spu = SpuProduct.builder()
                .category(category)
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .thumbnailUrl(request.getThumbnailUrl())
                .attributes(request.getAttributes())
                .status("ACTIVE")
                .variants(new ArrayList<>())
                .build();

        for (SkuCreateRequest skuReq : request.getVariants()) {
            if (skuRepository.existsBySkuCode(skuReq.getSkuCode())) {
                throw new AppException(ErrorCode.SKU_CODE_EXISTED, "SKU code already exists: " + skuReq.getSkuCode());
            }

            SkuVariant variant = SkuVariant.builder()
                    .skuCode(skuReq.getSkuCode())
                    .barcode(skuReq.getBarcode())
                    .price(skuReq.getPrice())
                    .compareAtPrice(skuReq.getCompareAtPrice())
                    .options(skuReq.getOptions())
                    .imageUrl(skuReq.getImageUrl() != null ? skuReq.getImageUrl() : request.getThumbnailUrl())
                    .active(true)
                    .build();

            spu.addVariant(variant);

            // Initialize inventory with optimistic versioning
            int initialStock = (skuReq.getInitialStock() != null && skuReq.getInitialStock() >= 0) ? skuReq.getInitialStock() : 0;
            InventoryItem inventoryItem = InventoryItem.builder()
                    .sku(variant)
                    .stockOnHand(initialStock)
                    .stockReserved(0)
                    .version(0L)
                    .build();

            variant.setInventoryItem(inventoryItem);
        }

        SpuProduct saved = spuRepository.save(spu);
        return mapToDetailResponse(saved);
    }

    private SpuResponse mapToSummaryResponse(SpuProduct spu) {
        BigDecimal minPrice = null;
        BigDecimal maxPrice = null;
        int totalStock = 0;

        if (spu.getVariants() != null && !spu.getVariants().isEmpty()) {
            for (SkuVariant v : spu.getVariants()) {
                if (minPrice == null || v.getPrice().compareTo(minPrice) < 0) {
                    minPrice = v.getPrice();
                }
                if (maxPrice == null || v.getPrice().compareTo(maxPrice) > 0) {
                    maxPrice = v.getPrice();
                }
                if (v.getInventoryItem() != null) {
                    totalStock += v.getInventoryItem().getAvailableStock();
                }
            }
        }

        return SpuResponse.builder()
                .id(spu.getId())
                .categoryId(spu.getCategory() != null ? spu.getCategory().getId() : null)
                .categoryName(spu.getCategory() != null ? spu.getCategory().getName() : "")
                .name(spu.getName())
                .slug(spu.getSlug())
                .thumbnailUrl(spu.getThumbnailUrl())
                .attributes(spu.getAttributes())
                .status(spu.getStatus())
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .totalStock(totalStock)
                .createdAt(spu.getCreatedAt())
                .build();
    }

    private SpuDetailResponse mapToDetailResponse(SpuProduct spu) {
        List<SkuResponse> variantResponses = spu.getVariants() != null
                ? spu.getVariants().stream().map(v -> {
            int onHand = v.getInventoryItem() != null ? v.getInventoryItem().getStockOnHand() : 0;
            int reserved = v.getInventoryItem() != null ? v.getInventoryItem().getStockReserved() : 0;
            int available = v.getInventoryItem() != null ? v.getInventoryItem().getAvailableStock() : 0;

            return SkuResponse.builder()
                    .id(v.getId())
                    .spuId(spu.getId())
                    .skuCode(v.getSkuCode())
                    .barcode(v.getBarcode())
                    .price(v.getPrice())
                    .compareAtPrice(v.getCompareAtPrice())
                    .options(v.getOptions())
                    .imageUrl(v.getImageUrl())
                    .active(v.isActive())
                    .stockOnHand(onHand)
                    .stockReserved(reserved)
                    .availableStock(available)
                    .build();
        }).toList()
                : List.of();

        return SpuDetailResponse.builder()
                .id(spu.getId())
                .categoryId(spu.getCategory() != null ? spu.getCategory().getId() : null)
                .categoryName(spu.getCategory() != null ? spu.getCategory().getName() : "")
                .categorySlug(spu.getCategory() != null ? spu.getCategory().getSlug() : "")
                .name(spu.getName())
                .slug(spu.getSlug())
                .description(spu.getDescription())
                .thumbnailUrl(spu.getThumbnailUrl())
                .attributes(spu.getAttributes())
                .status(spu.getStatus())
                .createdAt(spu.getCreatedAt())
                .variants(variantResponses)
                .build();
    }
}
