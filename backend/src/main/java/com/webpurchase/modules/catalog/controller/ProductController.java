package com.webpurchase.modules.catalog.controller;

import com.webpurchase.common.ApiResponse;
import com.webpurchase.modules.catalog.dto.request.SpuCreateRequest;
import com.webpurchase.modules.catalog.dto.response.SpuDetailResponse;
import com.webpurchase.modules.catalog.dto.response.SpuResponse;
import com.webpurchase.modules.catalog.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Products (SPU & SKU)", description = "Product catalog with JSONB attributes, GIN indexing and dynamic filtering")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get paginated products with optional category and dynamic JSONB attribute filtering")
    public ResponseEntity<ApiResponse<Page<SpuResponse>>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String ram,
            @RequestParam(required = false) String storage,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        Map<String, Object> dynamicFilters = new HashMap<>();
        if (brand != null && !brand.isBlank()) dynamicFilters.put("brand", brand);
        if (ram != null && !ram.isBlank()) dynamicFilters.put("ram", ram);
        if (storage != null && !storage.isBlank()) dynamicFilters.put("storage", storage);

        String[] sortParts = sort.split(",");
        String property = sortParts[0];
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, property));
        Page<SpuResponse> products = productService.getProducts(categoryId, dynamicFilters, pageRequest);

        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/suggest")
    @Operation(summary = "Smart search suggestion (with 300ms debounce on client)")
    public ResponseEntity<ApiResponse<List<SpuResponse>>> searchSuggest(@RequestParam String keyword) {
        List<SpuResponse> suggestions = productService.searchSuggest(keyword);
        return ResponseEntity.ok(ApiResponse.success(suggestions));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get product details by slug including all SKU variants and real-time inventory")
    public ResponseEntity<ApiResponse<SpuDetailResponse>> getProductBySlug(@PathVariable String slug) {
        SpuDetailResponse response = productService.getProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/id/{id}")
    @Operation(summary = "Get product details by ID")
    public ResponseEntity<ApiResponse<SpuDetailResponse>> getProductById(@PathVariable Long id) {
        SpuDetailResponse response = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CATALOG_WRITE')")
    @Operation(summary = "Create SPU product with SKU variants and initialize inventory (Admin/Manager only)")
    public ResponseEntity<ApiResponse<SpuDetailResponse>> createProduct(@Valid @RequestBody SpuCreateRequest request) {
        SpuDetailResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created successfully", response));
    }
}
