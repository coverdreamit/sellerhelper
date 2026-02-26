package com.sellerhelper.dto.naver;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * 네이버 상품 주문 1건 상세 (API 응답 data[] 한 요소)
 * order + productOrder + delivery 등
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NaverProductOrderDetail {

    @JsonProperty("order")
    private NaverOrderInfo order;

    @JsonProperty("productOrder")
    private NaverProductOrderSummary productOrder;

    @JsonProperty("delivery")
    private NaverDeliveryInfo delivery;
}
