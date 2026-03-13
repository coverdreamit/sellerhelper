package com.sellerhelper.service;

import com.sellerhelper.dto.vendor.VendorPolicyResponse;
import com.sellerhelper.dto.vendor.VendorPolicySaveRequest;
import com.sellerhelper.entity.Vendor;
import com.sellerhelper.entity.VendorPolicy;
import com.sellerhelper.repository.VendorPolicyRepository;
import com.sellerhelper.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VendorPolicyService {

    private final VendorRepository vendorRepository;
    private final VendorPolicyRepository vendorPolicyRepository;

    @Transactional
    public VendorPolicyResponse saveMyVendorPolicy(Long userUid, Long vendorUid, VendorPolicySaveRequest req) {
        Vendor vendor = vendorRepository.findByUidAndUser_Uid(vendorUid, userUid)
                .orElseThrow(() -> new IllegalArgumentException("발주업체를 찾을 수 없습니다."));

        VendorPolicy policy = vendorPolicyRepository.findByVendor_Uid(vendorUid)
                .orElseGet(() -> VendorPolicy.builder().vendor(vendor).build());

        apply(policy, req);
        return toResponse(vendorPolicyRepository.save(policy));
    }

    @Transactional(readOnly = true)
    public VendorPolicyResponse findByVendorUid(Long vendorUid) {
        return vendorPolicyRepository.findByVendor_Uid(vendorUid)
                .map(this::toResponse)
                .orElse(null);
    }

    VendorPolicyResponse toResponse(VendorPolicy p) {
        return VendorPolicyResponse.builder()
                .autoOrder(VendorPolicyResponse.AutoOrder.builder()
                        .enabled(p.getAutoOrderEnabled())
                        .stockThreshold(p.getStockThreshold())
                        .defaultOrderQty(p.getDefaultOrderQty())
                        .orderUnit(p.getOrderUnit())
                        .build())
                .leadTime(VendorPolicyResponse.LeadTime.builder()
                        .days(p.getLeadTimeDays())
                        .includeWeekend(p.getIncludeWeekend())
                        .build())
                .orderLimit(VendorPolicyResponse.OrderLimit.builder()
                        .minOrderQty(p.getMinOrderQty())
                        .minOrderAmount(p.getMinOrderAmount())
                        .build())
                .delivery(VendorPolicyResponse.Delivery.builder()
                        .shippingType(p.getShippingType())
                        .bundleAllowed(p.getBundleAllowed())
                        .build())
                .schedule(VendorPolicyResponse.Schedule.builder()
                        .orderableDays(splitDays(p.getOrderableDays()))
                        .cutoffTime(p.getCutoffTime())
                        .build())
                .useYn(p.getUseYn())
                .memo(p.getMemo())
                .build();
    }

    private void apply(VendorPolicy p, VendorPolicySaveRequest req) {
        VendorPolicySaveRequest.AutoOrder autoOrder = req != null ? req.getAutoOrder() : null;
        VendorPolicySaveRequest.LeadTime leadTime = req != null ? req.getLeadTime() : null;
        VendorPolicySaveRequest.OrderLimit orderLimit = req != null ? req.getOrderLimit() : null;
        VendorPolicySaveRequest.Delivery delivery = req != null ? req.getDelivery() : null;
        VendorPolicySaveRequest.Schedule schedule = req != null ? req.getSchedule() : null;

        p.setAutoOrderEnabled(autoOrder != null && Boolean.TRUE.equals(autoOrder.getEnabled()));
        p.setStockThreshold(autoOrder != null && autoOrder.getStockThreshold() != null ? Math.max(0, autoOrder.getStockThreshold()) : 0);
        p.setDefaultOrderQty(autoOrder != null && autoOrder.getDefaultOrderQty() != null ? Math.max(0, autoOrder.getDefaultOrderQty()) : 0);
        p.setOrderUnit(trimOrDefault(autoOrder != null ? autoOrder.getOrderUnit() : null, "EA"));

        p.setLeadTimeDays(leadTime != null && leadTime.getDays() != null ? Math.max(0, leadTime.getDays()) : 0);
        p.setIncludeWeekend(leadTime != null && Boolean.TRUE.equals(leadTime.getIncludeWeekend()));

        p.setMinOrderQty(orderLimit != null && orderLimit.getMinOrderQty() != null ? Math.max(0, orderLimit.getMinOrderQty()) : 1);
        p.setMinOrderAmount(orderLimit != null && orderLimit.getMinOrderAmount() != null ? Math.max(0L, orderLimit.getMinOrderAmount()) : 0L);

        p.setShippingType(trimOrDefault(delivery != null ? delivery.getShippingType() : null, "DIRECT"));
        p.setBundleAllowed(delivery == null || delivery.getBundleAllowed() == null || delivery.getBundleAllowed());

        p.setOrderableDays(joinDays(schedule != null ? schedule.getOrderableDays() : null));
        p.setCutoffTime(trimOrDefault(schedule != null ? schedule.getCutoffTime() : null, "18:00"));

        String useYn = trimOrDefault(req != null ? req.getUseYn() : null, "Y");
        p.setUseYn("N".equalsIgnoreCase(useYn) ? "N" : "Y");
        p.setMemo(trim(req != null ? req.getMemo() : null));
    }

    private List<String> splitDays(String joined) {
        if (joined == null || joined.isBlank()) return Collections.emptyList();
        return Arrays.stream(joined.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private String joinDays(List<String> days) {
        if (days == null || days.isEmpty()) return "";
        return days.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.joining(","));
    }

    private String trimOrDefault(String value, String defaultValue) {
        String trimmed = trim(value);
        return trimmed == null ? defaultValue : trimmed;
    }

    private String trim(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
