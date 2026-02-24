package com.sellerhelper.dto.auth;

import lombok.Builder;
import lombok.Getter;

/**
 * 회원가입 응답 - 승인 대기 상태
 */
@Getter
@Builder
public class RegisterResponse {

    private Long uid;
    private String loginId;
    private String name;
    private boolean approved;  // false = 승인 대기

    public static RegisterResponse of(Long uid, String loginId, String name, boolean approved) {
        return RegisterResponse.builder()
                .uid(uid)
                .loginId(loginId)
                .name(name)
                .approved(approved)
                .build();
    }
}
