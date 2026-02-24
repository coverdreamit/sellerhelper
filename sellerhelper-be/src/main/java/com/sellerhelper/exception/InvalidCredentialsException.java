package com.sellerhelper.exception;

/**
 * Invalid login ID or password
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Invalid login ID or password.");
    }

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
