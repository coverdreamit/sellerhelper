package com.sellerhelper.service.coupang;

/**
 * 쿠팡 Open API 엔드포인트 상수.
 * @see https://developers.coupangcorp.com
 */
public final class CoupangApiConstants {

    public static final String BASE_URL = "https://api-gateway.coupang.com";
    /** 연동 검증용 - 카테고리 조회 (쿼리 없음, 키만 검증) */
    public static final String PATH_DISPLAY_CATEGORIES = "/v2/providers/seller_api/apis/api/v1/marketplace/meta/display-categories/0";
    /** 상품 목록 조회 (vendorId + maxPerPage 필수) */
    public static final String PATH_SELLER_PRODUCTS = "/v2/providers/seller_api/apis/api/v1/marketplace/seller-products";

    private CoupangApiConstants() {}
}
