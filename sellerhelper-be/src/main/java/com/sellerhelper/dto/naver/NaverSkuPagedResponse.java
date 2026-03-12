package com.sellerhelper.dto.naver;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Collections;
import java.util.List;

/**
 * SKU 목록 페이지 조회 응답
 *
 * @see <a href="https://apicenter.commerce.naver.com/docs/commerce-api/current/get-ns-information-paged-list-nfa">SKU 목록 조회 API</a>
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NaverSkuPagedResponse {

    @JsonProperty("data")
    private List<NaverSkuItem> data;

    @JsonProperty("totalElements")
    private Long totalElements;

    @JsonProperty("totalPages")
    private Integer totalPages;

    @JsonProperty("page")
    private Integer page;

    @JsonProperty("size")
    private Integer size;

    public List<NaverSkuItem> getData() {
        return data != null ? data : Collections.emptyList();
    }
}
