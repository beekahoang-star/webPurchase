package com.webpurchase.common;

import lombok.Getter;

@Getter
public class AppException extends RuntimeException {

    private final ErrorCode errorCode;
    private final Object customData;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.customData = null;
    }

    public AppException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
        this.customData = null;
    }

    public AppException(ErrorCode errorCode, Object customData) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.customData = customData;
    }
}
