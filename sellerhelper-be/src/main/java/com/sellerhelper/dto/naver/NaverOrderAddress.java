package com.sellerhelper.dto.naver;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/** 네이버 API 배송지/수령지 주소 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NaverOrderAddress {

    @JsonProperty("name")
    private String name;

    @JsonProperty("tel1")
    private String tel1;

    @JsonProperty("tel2")
    private String tel2;

    @JsonProperty("zipCode")
    private String zipCode;

    @JsonProperty("baseAddress")
    private String baseAddress;

    @JsonProperty("detailedAddress")
    private String detailedAddress;

    @JsonProperty("city")
    private String city;

    @JsonProperty("state")
    private String state;

    @JsonProperty("country")
    private String country;
}
