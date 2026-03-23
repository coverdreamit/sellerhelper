package com.sellerhelper.dto.store;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;

/** 스토어 동기화 상품 행에 발주업체 연결 / 해제 */
@Getter
@Setter
@NoArgsConstructor
public class StoreProductVendorAssignRequest {

    @NotBlank
    private String sellerProductId;

    /** 쿠팡 옵션 ID 등. 없으면 빈 문자열(네이버 단일 옵션 등) */
    private String vendorItemId;

    /** null 이면 연결 해제 */
    private Long vendorUid;
}
