package com.sellerhelper.dto.auth;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/** 로그인 응답 */
@Getter
@Builder
public class LoginResponse {

    private Long uid;
    private String loginId;
    private String name;
    private List<String> roleCodes;

    public static LoginResponse of(Long uid, String loginId, String name, List<String> roleCodes) {
        return LoginResponse.builder()
                .uid(uid)
                .loginId(loginId)
                .name(name)
                .roleCodes(roleCodes)
                .build();
    }
}
