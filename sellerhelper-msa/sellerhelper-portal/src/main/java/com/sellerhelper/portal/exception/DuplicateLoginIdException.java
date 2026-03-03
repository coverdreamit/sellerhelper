package com.sellerhelper.portal.exception;

import lombok.Getter;

@Getter
public class DuplicateLoginIdException extends RuntimeException {

    private final String loginId;

    public DuplicateLoginIdException(String loginId) {
        super("Login ID already in use: " + loginId);
        this.loginId = loginId;
    }
}
