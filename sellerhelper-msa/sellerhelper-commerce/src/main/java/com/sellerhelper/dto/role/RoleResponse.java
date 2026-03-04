package com.sellerhelper.dto.role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/** 권한 응답 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleResponse {

    private Long uid;
    private String code;
    private String name;
    private String description;
    /** 접근 가능 메뉴 키 목록 */
    private List<String> menuKeys;
}
