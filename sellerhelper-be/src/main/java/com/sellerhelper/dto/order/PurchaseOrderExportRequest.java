package com.sellerhelper.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderExportRequest {

    @NotNull
    private Long vendorId;

    @NotEmpty
    private List<Long> orderUids;

    @NotEmpty
    private List<String> columnKeys;
}
