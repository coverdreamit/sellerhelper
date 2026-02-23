package com.sellerhelper.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/** 사용자 목록 한 행 응답 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserListResponse {

    private Long uid;
    private String loginId;
    private String name;
    private String email;
    /** 권한 이름 (콤마 구분, 예: 관리자, 셀러) */
    private String roleNames;
    /** 활성 여부 */
    private Boolean enabled;
    private Instant lastLoginAt;
}
