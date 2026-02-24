package com.sellerhelper.dto.store;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 스토어 응답 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreResponse {

    private Long uid;
    private Long mallUid;
    private String mallCode;
    private String mallName;
    private Long companyUid;
    private String companyName;
    private String name;
    private String mallSellerId;
    private Boolean enabled;
    /** 표시 순서 (탭 순서 등) */
    private Integer sortOrder;
    /** StoreAuth 존재 여부 (API 연동됨) */
    private Boolean hasAuth;
    /** API Key/Secret 저장 여부 (보안상 실제 값은 반환하지 않음) */
    private Boolean hasStoredCredentials;
}
