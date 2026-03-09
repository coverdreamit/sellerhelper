package com.sellerhelper.dto.shipping;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

/** 배송 목록 조회 결과 (페이징) */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingListResult {

    private List<ShippingListItem> contents;
    private int page;
    private int size;
    private long totalCount;
    private Instant lastSyncedAt;

    public static ShippingListResult empty(int page, int size) {
        return ShippingListResult.builder()
                .contents(Collections.emptyList())
                .page(page)
                .size(size)
                .totalCount(0L)
                .lastSyncedAt(null)
                .build();
    }
}
