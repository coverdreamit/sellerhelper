package com.sellerhelper.dto.naver;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/** 변경 상품 주문 내역 조회 페이징용 more 객체 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NaverLastChangedMore {

    @JsonProperty("moreFrom")
    private String moreFrom;

    @JsonProperty("moreSequence")
    private Integer moreSequence;
}
