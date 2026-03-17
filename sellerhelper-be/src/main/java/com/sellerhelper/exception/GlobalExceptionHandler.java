package com.sellerhelper.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.HttpMediaTypeNotSupportedException;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/** 전역 예외 핸들러 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @Value("${spring.profiles.active:}")
    private String activeProfile;

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleResourceNotFound(ResourceNotFoundException ex, WebRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());
        ApiError error = ApiError.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message(ex.getMessage())
                .timestamp(Instant.now())
                .path(getPath(request))
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiError> handleInvalidCredentials(InvalidCredentialsException ex, WebRequest request) {
        log.warn("Invalid credentials: {}", ex.getMessage());
        ApiError error = ApiError.builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .error("Unauthorized")
                .message(ex.getMessage())
                .timestamp(Instant.now())
                .path(getPath(request))
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        log.warn("IllegalArgument: {}", ex.getMessage());
        ApiError error = ApiError.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(ex.getMessage())
                .timestamp(Instant.now())
                .path(getPath(request))
                .build();
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiError> handleIllegalState(IllegalStateException ex, WebRequest request) {
        log.warn("IllegalState: {}", ex.getMessage());
        String message = sanitizeMessage(ex.getMessage());
        // 네이버/쿠팡 등 외부 API 실패는 502 (Bad Gateway). 그 외는 503.
        boolean externalApiFailure = message != null && (
                message.contains("네이버") || message.contains("쿠팡") || message.contains("API") || message.contains("토큰"));
        HttpStatus status = externalApiFailure ? HttpStatus.BAD_GATEWAY : HttpStatus.SERVICE_UNAVAILABLE;
        String errorLabel = externalApiFailure ? "Bad Gateway" : "Service Unavailable";
        ApiError error = ApiError.builder()
                .status(status.value())
                .error(errorLabel)
                .message(message)
                .timestamp(Instant.now())
                .path(getPath(request))
                .build();
        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(DuplicateLoginIdException.class)
    public ResponseEntity<ApiError> handleDuplicateLoginId(DuplicateLoginIdException ex, WebRequest request) {
        log.warn("Duplicate login ID: {}", ex.getLoginId());
        ApiError error = ApiError.builder()
                .status(HttpStatus.CONFLICT.value())
                .error("Conflict")
                .message(ex.getMessage())
                .timestamp(Instant.now())
                .path(getPath(request))
                .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, WebRequest request) {
        List<ApiError.FieldError> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new ApiError.FieldError(fe.getField(), fe.getDefaultMessage()))
                .collect(Collectors.toList());
        ApiError error = ApiError.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Failed")
                .message("Validation failed")
                .timestamp(Instant.now())
                .path(getPath(request))
                .fieldErrors(fieldErrors)
                .build();
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiError> handleBind(BindException ex, WebRequest request) {
        List<ApiError.FieldError> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new ApiError.FieldError(fe.getField(), fe.getDefaultMessage()))
                .collect(Collectors.toList());
        ApiError error = ApiError.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Failed")
                .message("Validation failed")
                .timestamp(Instant.now())
                .path(getPath(request))
                .fieldErrors(fieldErrors)
                .build();
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiError> handleMediaTypeNotSupported(
            HttpMediaTypeNotSupportedException ex, WebRequest request) {
        log.warn("Unsupported media type: {}", ex.getMessage());
        ApiError error = ApiError.builder()
                .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE.value())
                .error("Unsupported Media Type")
                .message("요청 형식이 올바르지 않습니다. 파일 업로드는 multipart/form-data 형식으로 전송해 주세요.")
                .timestamp(Instant.now())
                .path(getPath(request))
                .build();
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex, WebRequest request) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        String message = "Internal server error";
        if ("local".equals(activeProfile)) {
            message = ex.getMessage() != null ? ex.getMessage() : message;
        }
        ApiError error = ApiError.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message(message)
                .timestamp(Instant.now())
                .path(getPath(request))
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    private String getPath(WebRequest request) {
        return request.getDescription(false).replace("uri=", "");
    }

    /** 인코딩 깨진 메시지는 사용자에게 보내지 않음 */
    private static String sanitizeMessage(String message) {
        if (message == null || message.isEmpty()) return "요청을 처리하지 못했습니다.";
        String lower = message.toLowerCase();
        if (lower.contains("multipart/form-data") && lower.contains("not supported")) {
            return "요청 형식이 올바르지 않습니다. 파일 업로드는 multipart/form-data 형식으로 전송해 주세요.";
        }
        if (lower.contains("not a multipart request")) {
            return "파일 업로드 요청이 아닙니다. 파일을 포함해 다시 시도해 주세요.";
        }
        if (message.indexOf('\uFFFD') >= 0 || message.contains("?�")) return "요청을 처리하지 못했습니다. (API 응답 인코딩 오류 - 키·IP·권한을 확인하세요.)";
        return message;
    }
}
