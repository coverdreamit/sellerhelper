package com.sellerhelper.portal.dto.auth;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class LoginResponse {

    /** JWT 액세스 토큰 (Bearer) */
    private String token;
    private Long uid;
    private String loginId;
    private String name;
    private List<String> roleCodes;
    private List<String> menuKeys;
    private Long companyUid;

    public static LoginResponse of(String token, Long uid, String loginId, String name,
                                   List<String> roleCodes, List<String> menuKeys, Long companyUid) {
        return LoginResponse.builder()
                .token(token)
                .uid(uid)
                .loginId(loginId)
                .name(name)
                .roleCodes(roleCodes != null ? roleCodes : List.of())
                .menuKeys(menuKeys != null ? menuKeys : List.of())
                .companyUid(companyUid)
                .build();
    }
}
