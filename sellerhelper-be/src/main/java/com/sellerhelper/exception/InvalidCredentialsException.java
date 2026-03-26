package com.sellerhelper.exception;

/**
 * 로그인 아이디 또는 비밀번호 불일치
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("아이디 또는 비밀번호가 올바르지 않습니다.");
    }

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
