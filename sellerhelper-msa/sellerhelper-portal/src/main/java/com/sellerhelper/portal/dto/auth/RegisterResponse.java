package com.sellerhelper.portal.dto.auth;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RegisterResponse {

    private Long uid;
    private String loginId;
    private String name;
    private boolean approved;

    public static RegisterResponse of(Long uid, String loginId, String name, boolean approved) {
        return RegisterResponse.builder()
                .uid(uid)
                .loginId(loginId)
                .name(name)
                .approved(approved)
                .build();
    }
}
