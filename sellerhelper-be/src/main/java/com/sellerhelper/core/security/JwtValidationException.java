package com.sellerhelper.core.security;

import lombok.Getter;

@Getter
public class JwtValidationException extends RuntimeException {

    private final JwtErrorCode errorCode;

    public JwtValidationException(JwtErrorCode errorCode) {
        super(errorCode.name());
        this.errorCode = errorCode;
    }

    public enum JwtErrorCode {
        EXPIRED,
        MALFORMED,
        INVALID
    }
}
