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
    /** RG Order 목록 조회 (vendorId path에 포함) */
    public static final String PATH_RG_ORDERS_TEMPLATE = "/v2/providers/rg_open_api/apis/api/v1/vendors/%s/rg/orders";

    /** RG Order API path (vendorId 치환) */
    public static String pathRgOrders(String vendorId) {
        return String.format(PATH_RG_ORDERS_TEMPLATE, vendorId);
    }

    private CoupangApiConstants() {}
}
