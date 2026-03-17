package com.sellerhelper.dto.auth;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/** 로그인 응답 */
@Getter
@Builder
public class LoginResponse {

    /** JWT 액세스 토큰 (Bearer) - 로그인 시에만 포함, /me에서는 null */
    private String token;
    private Long uid;
    private String loginId;
    private String name;
    private List<String> roleCodes;
    /** 사용자 권한들의 메뉴 접근 키 합집합 */
    private List<String> menuKeys;
    /** 소속 회사 UID (null이면 회사 정보 미등록) */
    private Long companyUid;
    /** 사업자등록증명서 업로드 여부 */
    private Boolean businessDocumentUploaded;
    /** 승인 상태 */
    private String approvalStatus;

    /** 로그인 시 - token 포함 */
    public static LoginResponse of(String token, Long uid, String loginId, String name,
                                   List<String> roleCodes, List<String> menuKeys, Long companyUid,
                                   Boolean businessDocumentUploaded, String approvalStatus) {
        return LoginResponse.builder()
                .token(token)
                .uid(uid)
                .loginId(loginId)
                .name(name)
                .roleCodes(roleCodes != null ? roleCodes : List.of())
                .menuKeys(menuKeys != null ? menuKeys : List.of())
                .companyUid(companyUid)
                .businessDocumentUploaded(Boolean.TRUE.equals(businessDocumentUploaded))
                .approvalStatus(approvalStatus)
                .build();
    }

    /** /me 조회 시 - token 없음 */
    public static LoginResponse of(Long uid, String loginId, String name, List<String> roleCodes, List<String> menuKeys,
                                   Long companyUid, Boolean businessDocumentUploaded) {
        return of(null, uid, loginId, name, roleCodes, menuKeys, companyUid, businessDocumentUploaded, null);
    }

    public static LoginResponse of(Long uid, String loginId, String name, List<String> roleCodes, List<String> menuKeys) {
        return of(null, uid, loginId, name, roleCodes, menuKeys, null, false, null);
    }
}
