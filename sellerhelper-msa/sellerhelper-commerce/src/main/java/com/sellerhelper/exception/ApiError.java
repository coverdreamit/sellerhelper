package com.sellerhelper.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

/** API 에러 응답 포맷 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiError {

    private int status;
    private String error;
    private String message;

    @JsonFormat(shape = JsonFormat.Shape.STRING, timezone = "Asia/Seoul")
    private Instant timestamp;

    private String path;
    /** Validation 에러 필드별 메시지 */
    private List<FieldError> fieldErrors;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldError {
        private String field;
        private String message;
    }
}
