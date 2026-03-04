package com.sellerhelper.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

/** 사용자 단건 조회 응답 (password 제외) */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long uid;
    private String loginId;
    private String name;
    private String email;
    private String phone;
    private Boolean enabled;
    private Instant lastLoginAt;
    private Instant createdAt;
    /** 권한 코드 목록 (예: ADMIN, SELLER, ORDER) */
    private List<String> roleCodes;
    /** 권한 이름 목록 (예: 관리자, 셀러, 주문담당) */
    private List<String> roleNames;
}
