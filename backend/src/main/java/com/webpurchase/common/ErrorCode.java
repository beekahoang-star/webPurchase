package com.webpurchase.common;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    UNCATEGORIZED_EXCEPTION("ERR_999", "An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY("ERR_001", "Invalid message key", HttpStatus.BAD_REQUEST),
    VALIDATION_FAILED("ERR_002", "Validation failed for request payload", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED("ERR_003", "Authentication required or token expired", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED("ERR_004", "You do not have permission to perform this action", HttpStatus.FORBIDDEN),
    USER_NOT_FOUND("ERR_005", "User not found", HttpStatus.NOT_FOUND),
    USER_EXISTED("ERR_006", "User with given username or email already exists", HttpStatus.CONFLICT),
    CATEGORY_NOT_FOUND("ERR_101", "Category not found", HttpStatus.NOT_FOUND),
    CATEGORY_NAME_EXISTED("ERR_102", "Category slug or name already exists", HttpStatus.CONFLICT),
    PRODUCT_NOT_FOUND("ERR_201", "SPU Product not found", HttpStatus.NOT_FOUND),
    VARIANT_NOT_FOUND("ERR_202", "SKU Variant not found", HttpStatus.NOT_FOUND),
    SKU_CODE_EXISTED("ERR_203", "SKU code already exists", HttpStatus.CONFLICT),
    INVENTORY_NOT_FOUND("ERR_301", "Inventory item not found for requested SKU", HttpStatus.NOT_FOUND),
    INSUFFICIENT_STOCK("ERR_302", "Insufficient stock available for requested quantity", HttpStatus.BAD_REQUEST),
    INVENTORY_RACE_CONDITION("ERR_303", "Inventory update conflict detected due to high concurrency. Please retry.", HttpStatus.CONFLICT),
    ORDER_NOT_FOUND("ERR_401", "Order not found", HttpStatus.NOT_FOUND),
    ORDER_CANNOT_BE_CANCELLED("ERR_402", "Order cannot be cancelled in its current state", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
