package com.sellerhelper.dto.naver;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/** 변경 상품 주문 내역 조회 API 응답 래퍼 */
@Data
@Builder
public class NaverLastChangedResult {

    private List<NaverLastChangedItem> data;
    private NaverLastChangedMore more;
}
