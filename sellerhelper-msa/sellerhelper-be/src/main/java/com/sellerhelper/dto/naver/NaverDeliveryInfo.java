package com.sellerhelper.dto.naver;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/** 네이버 배송 정보 (delivery 객체) */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NaverDeliveryInfo {

    @JsonProperty("deliveryStatus")
    private String deliveryStatus;

    @JsonProperty("deliveryCompany")
    private String deliveryCompany;

    @JsonProperty("trackingNumber")
    private String trackingNumber;

    @JsonProperty("sendDate")
    private String sendDate;

    @JsonProperty("pickupDate")
    private String pickupDate;

    @JsonProperty("deliveredDate")
    private String deliveredDate;

    @JsonProperty("deliveryMethod")
    private String deliveryMethod;
}
