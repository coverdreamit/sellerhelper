package com.sellerhelper.dto.naver;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

/**
 * SKU 목록 페이지 조회 요청
 *
 * @see <a href="https://apicenter.commerce.naver.com/docs/commerce-api/current/get-ns-information-paged-list-nfa">SKU 목록 조회 API</a>
 */
@Data
@Builder
public class NaverSkuQueryPagedRequest {

    @JsonProperty("page")
    private Integer page;

    @JsonProperty("size")
    private Integer size;
}
