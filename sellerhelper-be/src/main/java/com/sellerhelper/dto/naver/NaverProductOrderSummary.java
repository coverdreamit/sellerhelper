package com.sellerhelper.dto.naver;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.Instant;

/**
 * 네이버 상품 주문 정보 (주문/배송/정산 조회 응답용 요약)
 * @see https://apicenter.commerce.naver.com/docs/commerce-api/2.68.0/schemas/%EC%83%81%ED%92%88-%EC%A3%BC%EB%AC%B8-%EC%A0%95%EB%B3%B4-%EA%B5%AC%EC%A1%B0%EC%B2%B4
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NaverProductOrderSummary {

    @JsonProperty("productOrderId")
    private String productOrderId;

    @JsonProperty("orderId")
    private String orderId;

    @JsonProperty("productId")
    private String productId;

    @JsonProperty("productName")
    private String productName;

    @JsonProperty("productOption")
    private String productOption;

    @JsonProperty("quantity")
    private Integer quantity;

    @JsonProperty("unitPrice")
    private Long unitPrice;

    @JsonProperty("totalPaymentAmount")
    private Long totalPaymentAmount;

    @JsonProperty("productOrderStatus")
    private String productOrderStatus;

    @JsonProperty("placeOrderDate")
    private String placeOrderDate;

    @JsonProperty("shippingDueDate")
    private String shippingDueDate;

    @JsonProperty("shippingStartDate")
    private String shippingStartDate;

    @JsonProperty("shippingMemo")
    private String shippingMemo;

    @JsonProperty("expectedSettlementAmount")
    private Long expectedSettlementAmount;

    @JsonProperty("deliveryFeeAmount")
    private Long deliveryFeeAmount;

    @JsonProperty("claimStatus")
    private String claimStatus;

    @JsonProperty("claimType")
    private String claimType;

    @JsonProperty("shippingAddress")
    private NaverOrderAddress shippingAddress;
}
