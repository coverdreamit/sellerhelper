package com.sellerhelper.portal.exception;

public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Invalid login ID or password.");
    }

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
