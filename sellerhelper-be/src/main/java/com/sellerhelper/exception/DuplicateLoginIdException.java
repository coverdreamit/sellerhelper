package com.sellerhelper.exception;

/** 로그인 ID 중복 */
public class DuplicateLoginIdException extends RuntimeException {

    private final String loginId;

    public DuplicateLoginIdException(String loginId) {
        super("이미 사용 중인 로그인 ID입니다: " + loginId);
        this.loginId = loginId;
    }

    public String getLoginId() {
        return loginId;
    }
}
