package com.sellerhelper.dto.purchase;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

@Getter
@Setter
public class PurchaseOrderHistoryCreateRequest {

    @NotBlank(message = "발주서명을 입력하세요.")
    @Size(max = 200)
    private String name;

    @Size(max = 1000)
    private String memo;

    @NotNull
    private Long storeUid;

    @NotNull
    private Long vendorId;

    @NotNull(message = "주문 UID 목록이 필요합니다.")
    private List<@NotNull Long> orderUids;

    @NotNull(message = "발주 컬럼 목록이 필요합니다.")
    private List<@NotBlank @Size(max = 64) String> columnKeys;
}
