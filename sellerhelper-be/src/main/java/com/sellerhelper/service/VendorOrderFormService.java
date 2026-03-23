package com.sellerhelper.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sellerhelper.dto.vendor.VendorOrderFormResponse;
import com.sellerhelper.dto.vendor.VendorOrderFormSaveRequest;
import com.sellerhelper.entity.Vendor;
import com.sellerhelper.entity.VendorOrderForm;
import com.sellerhelper.repository.VendorOrderFormRepository;
import com.sellerhelper.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VendorOrderFormService {

    private static final Set<String> ALLOWED_ORDER_COLUMN_KEYS = Set.of(
            "uid",
            "storeUid",
            "storeName",
            "mallOrderNo",
            "orderDate",
            "orderStatus",
            "totalAmount",
            "buyerName",
            "buyerPhone",
            "receiverName",
            "receiverAddress",
            "itemCount"
    );

    /** 발주 라인 컬럼 — VendorOrderLineDto / 상품-발주업체 연결 기준 주문 라인 필드와 동일 */
    private static final Set<String> ALLOWED_PURCHASE_COLUMN_KEYS = Set.of(
            "orderUid",
            "mallOrderNo",
            "orderDate",
            "orderStatus",
            "orderTotalAmount",
            "buyerName",
            "buyerPhone",
            "receiverName",
            "receiverPhone",
            "receiverAddress",
            "orderItemUid",
            "mallItemId",
            "productName",
            "optionInfo",
            "quantity",
            "productOrderStatus",
            "channelType",
            "externalProductId",
            "externalOptionId",
            "sellerSku"
    );

    private static final List<String> DEFAULT_PURCHASE_COLUMN_KEYS = List.of(
            "mallOrderNo",
            "mallItemId",
            "productName",
            "optionInfo",
            "quantity",
            "receiverName",
            "receiverPhone",
            "receiverAddress",
            "orderDate"
    );

    private final VendorOrderFormRepository vendorOrderFormRepository;
    private final VendorRepository vendorRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<VendorOrderFormResponse> findMyForms(Long userUid) {
        List<VendorOrderForm> rows = vendorOrderFormRepository.findByVendor_User_UidOrderByUidDesc(userUid);
        return rows.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VendorOrderFormResponse> findByVendor(Long userUid, Long vendorUid) {
        ensureMyVendor(userUid, vendorUid);
        return vendorOrderFormRepository.findByVendor_UidOrderByUidDesc(vendorUid).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public VendorOrderFormResponse create(Long userUid, Long vendorUid, VendorOrderFormSaveRequest req) {
        Vendor vendor = ensureMyVendor(userUid, vendorUid);
        List<String> keys = validateAndNormalizeKeys(req.getColumnKeys());
        List<String> purchaseKeys = req.getPurchaseColumnKeys() != null
                ? validatePurchaseKeys(req.getPurchaseColumnKeys())
                : List.copyOf(DEFAULT_PURCHASE_COLUMN_KEYS);
        VendorOrderForm entity = VendorOrderForm.builder()
                .vendor(vendor)
                .formName(req.getFormName().trim())
                .active(Boolean.TRUE.equals(req.getActive()))
                .columnKeysJson(writeJson(keys))
                .purchaseColumnKeysJson(writeJson(purchaseKeys))
                .build();
        return toResponse(vendorOrderFormRepository.save(entity));
    }

    @Transactional
    public VendorOrderFormResponse update(Long userUid, Long vendorUid, Long formUid, VendorOrderFormSaveRequest req) {
        VendorOrderForm form = vendorOrderFormRepository.findByUidAndVendor_Uid(formUid, vendorUid)
                .orElseThrow(() -> new IllegalArgumentException("발주 양식을 찾을 수 없습니다."));
        ensureMyVendor(userUid, vendorUid);
        List<String> keys = validateAndNormalizeKeys(req.getColumnKeys());
        form.setFormName(req.getFormName().trim());
        form.setActive(Boolean.TRUE.equals(req.getActive()));
        form.setColumnKeysJson(writeJson(keys));
        if (req.getPurchaseColumnKeys() != null) {
            form.setPurchaseColumnKeysJson(writeJson(validatePurchaseKeys(req.getPurchaseColumnKeys())));
        }
        return toResponse(vendorOrderFormRepository.save(form));
    }

    @Transactional
    public void delete(Long userUid, Long vendorUid, Long formUid) {
        VendorOrderForm form = vendorOrderFormRepository.findByUidAndVendor_Uid(formUid, vendorUid)
                .orElseThrow(() -> new IllegalArgumentException("발주 양식을 찾을 수 없습니다."));
        ensureMyVendor(userUid, vendorUid);
        vendorOrderFormRepository.delete(form);
    }

    private Vendor ensureMyVendor(Long userUid, Long vendorUid) {
        return vendorRepository.findByUidAndUser_Uid(vendorUid, userUid)
                .orElseThrow(() -> new IllegalArgumentException("발주업체를 찾을 수 없습니다."));
    }

    private List<String> validateAndNormalizeKeys(List<String> columnKeys) {
        if (columnKeys == null || columnKeys.isEmpty()) {
            throw new IllegalArgumentException("최소 한 개 이상의 컬럼을 선택하세요.");
        }
        LinkedHashSet<String> seen = new LinkedHashSet<>();
        for (String k : columnKeys) {
            if (k == null || k.isBlank()) {
                continue;
            }
            String key = k.trim();
            if (!ALLOWED_ORDER_COLUMN_KEYS.contains(key)) {
                throw new IllegalArgumentException("허용되지 않는 컬럼 키입니다: " + key);
            }
            seen.add(key);
        }
        if (seen.isEmpty()) {
            throw new IllegalArgumentException("최소 한 개 이상의 컬럼을 선택하세요.");
        }
        return List.copyOf(seen);
    }

    private List<String> validatePurchaseKeys(List<String> columnKeys) {
        if (columnKeys == null || columnKeys.isEmpty()) {
            throw new IllegalArgumentException("발주 라인 컬럼을 한 개 이상 선택하세요.");
        }
        LinkedHashSet<String> seen = new LinkedHashSet<>();
        for (String k : columnKeys) {
            if (k == null || k.isBlank()) {
                continue;
            }
            String key = k.trim();
            if (!ALLOWED_PURCHASE_COLUMN_KEYS.contains(key)) {
                throw new IllegalArgumentException("허용되지 않는 발주 라인 컬럼 키입니다: " + key);
            }
            seen.add(key);
        }
        if (seen.isEmpty()) {
            throw new IllegalArgumentException("발주 라인 컬럼을 한 개 이상 선택하세요.");
        }
        return List.copyOf(seen);
    }

    private String writeJson(List<String> keys) {
        try {
            return objectMapper.writeValueAsString(keys);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("컬럼 설정 저장 실패", e);
        }
    }

    private List<String> readKeys(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }

    private List<String> normalizeStoredPurchaseKeys(List<String> raw) {
        if (raw == null || raw.isEmpty()) {
            return List.copyOf(DEFAULT_PURCHASE_COLUMN_KEYS);
        }
        LinkedHashSet<String> seen = new LinkedHashSet<>();
        for (String k : raw) {
            if (k == null || k.isBlank()) {
                continue;
            }
            String key = k.trim();
            if (ALLOWED_PURCHASE_COLUMN_KEYS.contains(key)) {
                seen.add(key);
            }
        }
        if (seen.isEmpty()) {
            return List.copyOf(DEFAULT_PURCHASE_COLUMN_KEYS);
        }
        return List.copyOf(seen);
    }

    private VendorOrderFormResponse toResponse(VendorOrderForm f) {
        List<String> purchaseKeys = normalizeStoredPurchaseKeys(readKeys(f.getPurchaseColumnKeysJson()));
        return VendorOrderFormResponse.builder()
                .formUid(f.getUid())
                .vendorUid(f.getVendor().getUid())
                .vendorName(f.getVendor().getVendorName())
                .formName(f.getFormName())
                .active(Boolean.TRUE.equals(f.getActive()))
                .columnKeys(readKeys(f.getColumnKeysJson()))
                .purchaseColumnKeys(purchaseKeys)
                .updatedAt(f.getUpdatedAt() != null ? f.getUpdatedAt() : f.getCreatedAt())
                .build();
    }
}
