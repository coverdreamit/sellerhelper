package com.sellerhelper.dto.vendor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.Valid;
import javax.validation.constraints.Size;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorPolicySaveRequest {

    @Valid
    private AutoOrder autoOrder;

    @Valid
    private LeadTime leadTime;

    @Valid
    private OrderLimit orderLimit;

    @Valid
    private Delivery delivery;

    @Valid
    private Schedule schedule;

    @Size(max = 1)
    private String useYn;

    @Size(max = 500)
    private String memo;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AutoOrder {
        private Boolean enabled;
        private Integer stockThreshold;
        private Integer defaultOrderQty;
        @Size(max = 20)
        private String orderUnit;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LeadTime {
        private Integer days;
        private Boolean includeWeekend;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderLimit {
        private Integer minOrderQty;
        private Long minOrderAmount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Delivery {
        @Size(max = 20)
        private String shippingType;
        private Boolean bundleAllowed;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Schedule {
        private List<String> orderableDays;
        @Size(max = 10)
        private String cutoffTime;
    }
}
