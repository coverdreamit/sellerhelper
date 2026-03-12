package com.sellerhelper.dto.naver;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * SKU 목록 조회 응답 1건 (물류 SKU 정보)
 *
 * @see <a href="https://apicenter.commerce.naver.com/docs/commerce-api/current/get-ns-information-paged-list-nfa">SKU 목록 조회 API</a>
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NaverSkuItem {

    @JsonProperty("sellerManagementCode")
    private String sellerManagementCode;

    @JsonProperty("productName")
    private String productName;

    @JsonProperty("optionName")
    private String optionName;

    @JsonProperty("quantity")
    private Integer quantity;
}
