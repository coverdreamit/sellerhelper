package com.sellerhelper.dto.naver;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/** 변경 상품 주문 내역 조회 응답 1건 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NaverLastChangedItem {

    @JsonProperty("productOrderId")
    private String productOrderId;

    @JsonProperty("lastChangedDate")
    private String lastChangedDate;

    @JsonProperty("productOrderStatus")
    private String productOrderStatus;

    /** 최종 변경 구분 (참고: last-changed-statuses API 응답) */
    @JsonProperty("lastChangedType")
    private String lastChangedType;
}
