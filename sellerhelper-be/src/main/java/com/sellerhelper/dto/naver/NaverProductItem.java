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
    private Integer stockQuantity;
    private String statusType;
    private String representativeImageUrl;
    private String leafCategoryId;

    public static NaverProductItem empty() {
        return new NaverProductItem();
    }
}
