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
    /** 사용자 권한들의 메뉴 접근 키 합집합 */
    private List<String> menuKeys;

    public static LoginResponse of(Long uid, String loginId, String name, List<String> roleCodes, List<String> menuKeys) {
        return LoginResponse.builder()
                .uid(uid)
                .loginId(loginId)
                .name(name)
                .roleCodes(roleCodes)
                .menuKeys(menuKeys != null ? menuKeys : List.of())
                .build();
    }
}
