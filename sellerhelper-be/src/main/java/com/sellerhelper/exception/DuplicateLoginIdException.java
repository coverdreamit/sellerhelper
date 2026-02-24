package com.sellerhelper.exception;

/** 로그인 ID 중복 */
public class DuplicateLoginIdException extends RuntimeException {

    private final String loginId;

    public DuplicateLoginIdException(String loginId) {
        super("Login ID already in use: " + loginId);
        this.loginId = loginId;
    }

    public String getLoginId() {
        return loginId;
    }
}
