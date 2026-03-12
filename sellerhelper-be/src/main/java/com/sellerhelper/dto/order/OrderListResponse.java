package com.sellerhelper.dto.order;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

/** 주문 목록 1건 응답 (DB 저장분 조회) */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderListResponse {

    private Long uid;
    private Long storeUid;
    private String storeName;
    private String mallOrderNo;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Seoul")
    private Instant orderDate;
    private String orderStatus;
    private BigDecimal totalAmount;
    private String buyerName;
    private String buyerPhone;
    private String receiverName;
    private String receiverAddress;
    /** 상품주문 건수 (같은 주문번호 내) */
    private int itemCount;
}
