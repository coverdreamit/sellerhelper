package com.sellerhelper.dto.naver;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 네이버 스마트스토어 상품 1건 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NaverProductItem {

    private String channelProductNo;
    private String productName;
    private Long salePrice;
    private Long originalPrice;
    private Integer stockQuantity;
    private String statusType;
    private String representativeImageUrl;
    private String leafCategoryId;
    /** 쿠팡 옵션 단위 목록용: 옵션 ID (vendorItemId) */
    private String vendorItemId;
    /** 쿠팡 옵션 단위 목록용: 옵션 정보 (예: 250ml 12개입) */
    private String optionName;
    /** API 원문(가공 전) JSON 문자열. 동기화 저장용 내부 필드 */
    private String rawPayload;

    public static NaverProductItem empty() {
        return new NaverProductItem();
    }
}
