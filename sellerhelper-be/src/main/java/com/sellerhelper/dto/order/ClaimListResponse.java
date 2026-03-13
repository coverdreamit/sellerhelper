package com.sellerhelper.dto.order;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

/** 취소/반품/교환 목록 1건 응답 (OrderItem 기준) */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClaimListResponse {

    /** 주문상품(클레임) UID */
    private Long orderItemUid;
    /** 주문 UID */
    private Long orderUid;
    /** 쇼핑몰 주문번호 */
    private String mallOrderNo;
    /** 쇼핑몰 상품주문 ID (클레임 식별용) */
    private String mallItemId;
    private Long storeUid;
    private String storeName;
    /** 클레임 유형: CANCEL, RETURN, EXCHANGE 등 (productOrderStatus 기반) */
    private String claimType;
    /** 상품주문 상태 (원본값) */
    private String productOrderStatus;
    private String productName;
    private String optionInfo;
    private Integer quantity;
    private BigDecimal totalPrice;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Seoul")
    private Instant orderDate;
}
