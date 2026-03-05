package com.sellerhelper.dto.naver;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * 네이버 주문 공통 정보 (order 객체)
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NaverOrderInfo {

    @JsonProperty("orderId")
    private String orderId;

    @JsonProperty("orderDate")
    private String orderDate;

    @JsonProperty("paymentDate")
    private String paymentDate;

    @JsonProperty("paymentMeans")
    private String paymentMeans;

    @JsonProperty("ordererName")
    private String ordererName;

    @JsonProperty("ordererTel")
    private String ordererTel;

    @JsonProperty("ordererId")
    private String ordererId;
}
