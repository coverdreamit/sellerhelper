package com.sellerhelper.dto.naver;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/** 상품 주문 상세 내역 조회 요청 (POST body, 최대 300개) */
@Data
@Builder
public class NaverProductOrderQueryRequest {

    @JsonProperty("productOrderIds")
    private List<String> productOrderIds;
}
