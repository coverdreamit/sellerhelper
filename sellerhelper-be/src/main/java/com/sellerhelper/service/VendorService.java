package com.sellerhelper.service;

import com.sellerhelper.dto.vendor.VendorResponse;
import com.sellerhelper.dto.vendor.VendorSaveRequest;
import com.sellerhelper.entity.User;
import com.sellerhelper.entity.Vendor;
import com.sellerhelper.entity.VendorPolicy;
import com.sellerhelper.repository.UserRepository;
import com.sellerhelper.repository.VendorPolicyRepository;
import com.sellerhelper.repository.VendorRepository;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final VendorPolicyRepository vendorPolicyRepository;
    private final VendorPolicyService vendorPolicyService;
    private final BusinessVerificationService businessVerificationService;

    @Value("${app.business-verification.recheck-batch-size:100}")
    private int recheckBatchSize;

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

        String normalizedBizNo = businessVerificationService.normalizeBusinessNumber(req.getBizNo());

        Vendor vendor = Vendor.builder()
                .user(user)
                .vendorName(trim(req.getVendorName()))
                .businessNumber(normalizedBizNo)
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

        verifyVendorBusinessIfEnabled(vendor);

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
        vendor.setBusinessNumber(businessVerificationService.normalizeBusinessNumber(req.getBizNo()));
        vendor.setManagerName(trim(req.getManagerName()));
        vendor.setAddress(trim(req.getAddress()));
        vendor.setAddressDetail(trim(req.getAddressDetail()));
        vendor.setPhone(trim(req.getPhone()));
        vendor.setEmail(trim(req.getEmail()));
        vendor.setMemo(trim(req.getMemo()));
        vendor.setActive(req.getIsActive() == null || req.getIsActive());

        verifyVendorBusinessIfEnabled(vendor);

        VendorPolicy policy = vendorPolicyRepository.findByVendor_Uid(vendor.getUid()).orElse(null);
        return toResponse(vendorRepository.save(vendor), policy);
    }

    @Transactional
    public VendorResponse verifyMyVendor(Long userUid, Long vendorUid) {
        if (!businessVerificationService.isVerificationEnabled()) {
            throw new IllegalStateException("사업자 검증 기능이 비활성화되어 있습니다.");
        }
        Vendor vendor = vendorRepository.findByUidAndUser_Uid(vendorUid, userUid)
                .orElseThrow(() -> new IllegalArgumentException("발주업체를 찾을 수 없습니다."));

        verifySingleVendor(vendor, true);
        VendorPolicy policy = vendorPolicyRepository.findByVendor_Uid(vendor.getUid()).orElse(null);
        return toResponse(vendorRepository.save(vendor), policy);
    }

    @Scheduled(cron = "${app.business-verification.recheck-cron:0 0 4 * * *}")
    @Transactional
    public void recheckActiveVendors() {
        if (!businessVerificationService.isVerificationEnabled()) {
            return;
        }
        int size = Math.max(1, recheckBatchSize);
        List<Vendor> targets = vendorRepository.findByActiveTrueAndBusinessNumberIsNotNullOrderByUidAsc(PageRequest.of(0, size));
        if (targets.isEmpty()) {
            return;
        }

        int success = 0;
        int failed = 0;
        for (Vendor vendor : targets) {
            try {
                verifySingleVendor(vendor, false);
                success++;
            } catch (RuntimeException ex) {
                failed++;
                log.warn("사업자 재검증 실패 vendorUid={} message={}", vendor.getUid(), ex.getMessage());
            }
        }
        vendorRepository.saveAll(targets);
        log.info("사업자 재검증 완료: total={}, success={}, failed={}", targets.size(), success, failed);
    }

    private VendorResponse toResponse(Vendor vendor, VendorPolicy policy) {
        return VendorResponse.builder()
                .vendorId(vendor.getUid())
                .userId(vendor.getUser().getUid())
                .vendorName(vendor.getVendorName())
                .bizNo(vendor.getBusinessNumber())
                .businessVerified(vendor.getBusinessVerified())
                .businessVerifiedAt(vendor.getBusinessVerifiedAt())
                .businessStatusCode(vendor.getBusinessStatusCode())
                .businessStatusText(vendor.getBusinessStatusText())
                .businessTaxType(vendor.getBusinessTaxType())
                .businessClosedAt(vendor.getBusinessClosedAt())
                .businessVerifyMessage(vendor.getBusinessVerifyMessage())
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

    private void verifyVendorBusinessIfEnabled(Vendor vendor) {
        if (!businessVerificationService.isVerificationEnabled()) {
            resetVerificationInfo(vendor, "사업자 검증 비활성화");
            return;
        }
        verifySingleVendor(vendor, true);
    }

    private void verifySingleVendor(Vendor vendor, boolean strict) {
        if (!StringUtils.hasText(vendor.getBusinessNumber())) {
            resetVerificationInfo(vendor, "사업자등록번호 없음");
            if (strict) {
                throw new IllegalArgumentException("사업자등록번호는 필수입니다.");
            }
            return;
        }

        BusinessVerificationService.VerificationResult result =
                businessVerificationService.verifyBusinessStatus(vendor.getBusinessNumber());

        vendor.setBusinessNumber(result.getNormalizedBusinessNumber());
        vendor.setBusinessVerified(result.isVerified());
        vendor.setBusinessVerifiedAt(result.getVerifiedAt());
        vendor.setBusinessStatusCode(trim(result.getStatusCode()));
        vendor.setBusinessStatusText(trim(result.getStatusText()));
        vendor.setBusinessTaxType(trim(result.getTaxType()));
        vendor.setBusinessClosedAt(trim(result.getClosedAt()));
        vendor.setBusinessVerifyMessage(trim(result.getMessage()));

        if (strict && !result.isVerified()) {
            throw new IllegalArgumentException("휴업/폐업 또는 유효하지 않은 사업자 상태입니다.");
        }
    }

    private void resetVerificationInfo(Vendor vendor, String message) {
        vendor.setBusinessVerified(false);
        vendor.setBusinessVerifiedAt(null);
        vendor.setBusinessStatusCode(null);
        vendor.setBusinessStatusText(null);
        vendor.setBusinessTaxType(null);
        vendor.setBusinessClosedAt(null);
        vendor.setBusinessVerifyMessage(trim(message));
    }

    private String trim(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
