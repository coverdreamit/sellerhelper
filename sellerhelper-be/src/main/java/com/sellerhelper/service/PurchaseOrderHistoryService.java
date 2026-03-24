package com.sellerhelper.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sellerhelper.dto.purchase.PurchaseOrderHistoryCreateRequest;
import com.sellerhelper.dto.purchase.PurchaseOrderHistoryResponse;
import com.sellerhelper.dto.purchase.PurchaseOrderHistoryUpdateRequest;
import com.sellerhelper.entity.PurchaseOrderHistory;
import com.sellerhelper.entity.Store;
import com.sellerhelper.entity.User;
import com.sellerhelper.entity.Vendor;
import com.sellerhelper.repository.PurchaseOrderHistoryRepository;
import com.sellerhelper.repository.StoreRepository;
import com.sellerhelper.repository.UserRepository;
import com.sellerhelper.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderHistoryService {

    private final PurchaseOrderHistoryRepository purchaseOrderHistoryRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final VendorRepository vendorRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<PurchaseOrderHistoryResponse> findMine(Long userUid) {
        return purchaseOrderHistoryRepository.findByUser_UidOrderByCreatedAtDescUidDesc(userUid).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PurchaseOrderHistoryResponse create(Long userUid, PurchaseOrderHistoryCreateRequest request) {
        User user = getUser(userUid);
        Store store = getMyStore(user, request.getStoreUid());
        Vendor vendor = getMyVendor(userUid, request.getVendorId());
        PurchaseOrderHistory entity = PurchaseOrderHistory.builder()
                .user(user)
                .store(store)
                .vendor(vendor)
                .formName(request.getName().trim())
                .memo(trimToNull(request.getMemo()))
                .orderUidsJson(writeJsonLongList(normalizeOrderUids(request.getOrderUids())))
                .columnKeysJson(writeJsonStringList(normalizeColumnKeys(request.getColumnKeys())))
                .build();
        return toResponse(purchaseOrderHistoryRepository.save(entity));
    }

    @Transactional
    public PurchaseOrderHistoryResponse update(Long userUid, Long uid, PurchaseOrderHistoryUpdateRequest request) {
        PurchaseOrderHistory entity = purchaseOrderHistoryRepository.findByUidAndUser_Uid(uid, userUid)
                .orElseThrow(() -> new IllegalArgumentException("발주서 이력을 찾을 수 없습니다."));
        Vendor vendor = getMyVendor(userUid, request.getVendorId());
        entity.setFormName(request.getName().trim());
        entity.setMemo(trimToNull(request.getMemo()));
        entity.setVendor(vendor);
        entity.setOrderUidsJson(writeJsonLongList(normalizeOrderUids(request.getOrderUids())));
        entity.setColumnKeysJson(writeJsonStringList(normalizeColumnKeys(request.getColumnKeys())));
        return toResponse(purchaseOrderHistoryRepository.save(entity));
    }

    @Transactional
    public void delete(Long userUid, Long uid) {
        PurchaseOrderHistory entity = purchaseOrderHistoryRepository.findByUidAndUser_Uid(uid, userUid)
                .orElseThrow(() -> new IllegalArgumentException("발주서 이력을 찾을 수 없습니다."));
        purchaseOrderHistoryRepository.delete(entity);
    }

    private User getUser(Long userUid) {
        return userRepository.findById(userUid)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    private Store getMyStore(User user, Long storeUid) {
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new IllegalArgumentException("스토어를 찾을 수 없습니다."));
        if (user.getCompany() == null || store.getCompany() == null
                || !user.getCompany().getUid().equals(store.getCompany().getUid())) {
            throw new IllegalArgumentException("해당 스토어에 접근할 권한이 없습니다.");
        }
        return store;
    }

    private Vendor getMyVendor(Long userUid, Long vendorUid) {
        return vendorRepository.findByUidAndUser_Uid(vendorUid, userUid)
                .orElseThrow(() -> new IllegalArgumentException("발주업체를 찾을 수 없습니다."));
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private List<Long> normalizeOrderUids(List<Long> orderUids) {
        if (orderUids == null || orderUids.isEmpty()) {
            throw new IllegalArgumentException("주문 UID를 한 개 이상 선택하세요.");
        }
        LinkedHashSet<Long> normalized = new LinkedHashSet<>();
        for (Long uid : orderUids) {
            if (uid != null) normalized.add(uid);
        }
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("주문 UID를 한 개 이상 선택하세요.");
        }
        return List.copyOf(normalized);
    }

    private List<String> normalizeColumnKeys(List<String> columnKeys) {
        if (columnKeys == null || columnKeys.isEmpty()) {
            throw new IllegalArgumentException("발주 컬럼을 한 개 이상 선택하세요.");
        }
        LinkedHashSet<String> normalized = new LinkedHashSet<>();
        for (String key : columnKeys) {
            if (key == null) continue;
            String trimmed = key.trim();
            if (!trimmed.isEmpty()) normalized.add(trimmed);
        }
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("발주 컬럼을 한 개 이상 선택하세요.");
        }
        return List.copyOf(normalized);
    }

    private String writeJsonLongList(List<Long> values) {
        try {
            return objectMapper.writeValueAsString(values);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("주문 UID 저장 실패", e);
        }
    }

    private String writeJsonStringList(List<String> values) {
        try {
            return objectMapper.writeValueAsString(values);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("컬럼 저장 실패", e);
        }
    }

    private List<Long> readLongList(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<Long>>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }

    private List<String> readStringList(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }

    private PurchaseOrderHistoryResponse toResponse(PurchaseOrderHistory entity) {
        return PurchaseOrderHistoryResponse.builder()
                .uid(entity.getUid())
                .name(entity.getFormName())
                .memo(entity.getMemo())
                .storeUid(entity.getStore().getUid())
                .storeName(entity.getStore().getName())
                .vendorId(entity.getVendor().getUid())
                .vendorName(entity.getVendor().getVendorName())
                .orderUids(readLongList(entity.getOrderUidsJson()))
                .columnKeys(readStringList(entity.getColumnKeysJson()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt() : entity.getCreatedAt())
                .build();
    }
}
