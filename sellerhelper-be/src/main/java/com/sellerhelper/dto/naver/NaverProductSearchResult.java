package com.sellerhelper.dto.naver;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Collections;
import java.util.List;

/** 네이버 스마트스토어 상품목록 조회 결과 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NaverProductSearchResult {

    private List<NaverProductItem> contents;
    private int page;
    private int size;
    private int totalCount;

    public static NaverProductSearchResult empty(int page, int size) {
        return NaverProductSearchResult.builder()
                .contents(Collections.emptyList())
                .page(page)
                .size(size)
                .totalCount(0)
                .build();
    }
}
