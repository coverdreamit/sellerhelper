package com.sellerhelper.service;

import com.sellerhelper.dto.vendor.VendorResponse;
import com.sellerhelper.dto.vendor.VendorSaveRequest;
import com.sellerhelper.entity.User;
import com.sellerhelper.entity.Vendor;
import com.sellerhelper.entity.VendorPolicy;
import com.sellerhelper.repository.UserRepository;
import com.sellerhelper.repository.VendorPolicyRepository;
import com.sellerhelper.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final VendorPolicyRepository vendorPolicyRepository;
    private final VendorPolicyService vendorPolicyService;

    @Transactional(readOnly = true)
    public List<VendorResponse> findMyVendors(Long userUid) {
        List<Vendor> vendors = vendorRepository.findByUser_UidOrderByUidDesc(userUid);
        Map<Long, VendorPolicy> policyByVendorUid = vendors.isEmpty()
                ? Collections.emptyMap()
                : vendorPolicyRepository.findByVendor_UidIn(
                        vendors.stream().map(Vendor::getUid).collect(Collectors.toList())
                ).stream().collect(Collectors.toMap(vp -> vp.getVendor().getUid(), Function.identity()));

        return vendors.stream()
                .map(vendor -> toResponse(vendor, policyByVendorUid.get(vendor.getUid())))
                .collect(Collectors.toList());
    }

    @Transactional
    public VendorResponse createMyVendor(Long userUid, VendorSaveRequest req) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Vendor vendor = Vendor.builder()
                .user(user)
                .vendorName(trim(req.getVendorName()))
                .businessNumber(trim(req.getBizNo()))
                .managerName(trim(req.getManagerName()))
                .address(trim(req.getAddress()))
                .addressDetail(trim(req.getAddressDetail()))
                .phone(trim(req.getPhone()))
                .email(trim(req.getEmail()))
                .memo(trim(req.getMemo()))
                .orderMethod("ETC")
                .shippingType("DIRECT")
                .active(req.getIsActive() == null || req.getIsActive())
                .build();

        Vendor savedVendor = vendorRepository.save(vendor);
        VendorPolicy savedPolicy = vendorPolicyRepository.findByVendor_Uid(savedVendor.getUid())
                .orElseGet(() -> vendorPolicyRepository.save(
                        VendorPolicy.builder()
                                .vendor(savedVendor)
                                .build()
                ));

        return toResponse(savedVendor, savedPolicy);
    }

    @Transactional
    public VendorResponse updateMyVendor(Long userUid, Long vendorUid, VendorSaveRequest req) {
        Vendor vendor = vendorRepository.findByUidAndUser_Uid(vendorUid, userUid)
                .orElseThrow(() -> new IllegalArgumentException("발주업체를 찾을 수 없습니다."));

        vendor.setVendorName(trim(req.getVendorName()));
        vendor.setBusinessNumber(trim(req.getBizNo()));
        vendor.setManagerName(trim(req.getManagerName()));
        vendor.setAddress(trim(req.getAddress()));
        vendor.setAddressDetail(trim(req.getAddressDetail()));
        vendor.setPhone(trim(req.getPhone()));
        vendor.setEmail(trim(req.getEmail()));
        vendor.setMemo(trim(req.getMemo()));
        vendor.setActive(req.getIsActive() == null || req.getIsActive());

        VendorPolicy policy = vendorPolicyRepository.findByVendor_Uid(vendor.getUid()).orElse(null);
        return toResponse(vendorRepository.save(vendor), policy);
    }

    private VendorResponse toResponse(Vendor vendor, VendorPolicy policy) {
        return VendorResponse.builder()
                .vendorId(vendor.getUid())
                .userId(vendor.getUser().getUid())
                .vendorName(vendor.getVendorName())
                .bizNo(vendor.getBusinessNumber())
                .managerName(vendor.getManagerName())
                .address(vendor.getAddress())
                .addressDetail(vendor.getAddressDetail())
                .phone(vendor.getPhone())
                .email(vendor.getEmail())
                .orderMethod(vendor.getOrderMethod())
                .shippingType(vendor.getShippingType())
                .isActive(vendor.getActive())
                .memo(vendor.getMemo())
                .policy(policy != null ? vendorPolicyService.toResponse(policy) : null)
                .createdAt(vendor.getCreatedAt())
                .updatedAt(vendor.getUpdatedAt())
                .build();
    }

    private String trim(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
