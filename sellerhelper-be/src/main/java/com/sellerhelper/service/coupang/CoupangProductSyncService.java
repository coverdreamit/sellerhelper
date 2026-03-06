package com.sellerhelper.service.coupang;

import com.sellerhelper.entity.Store;
import com.sellerhelper.entity.StoreProduct;
import com.sellerhelper.exception.ResourceNotFoundException;
import com.sellerhelper.repository.StoreProductRepository;
import com.sellerhelper.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 쿠팡 상품 DB 동기화 전담.
 * 기존 데이터 조회 후 vendorItemId 우선(없으면 seller_product_id + option_name) 키로 변경분만 update, 신규만 insert, 누락은 DELETED 처리.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CoupangProductSyncService {

    private final CoupangCommerceProductService coupangCommerceProductService;
    private final StoreProductRepository storeProductRepository;
    private final StoreRepository storeRepository;

    /**
     * 변경분만 반영: 신규 insert, 변경 update, API에서 빠진 항목은 status_type = DELETED (soft delete).
     */
    @Transactional
    public SyncResult syncProducts(Long storeUid) {
        Store store = storeRepository.findByIdForUpdate(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        if (store.getMall() == null || !"COUPANG".equalsIgnoreCase(store.getMall().getCode())) {
            throw new IllegalArgumentException("쿠팡 스토어만 동기화할 수 있습니다.");
        }

        List<CoupangCommerceProductService.CoupangSyncItem> remoteItems =
                coupangCommerceProductService.fetchAllProductDetails(storeUid);

        List<StoreProduct> existing = storeProductRepository.findAllByStore_Uid(storeUid);
        Map<String, StoreProduct> existingMap = existing.stream()
                .collect(Collectors.toMap(this::makeKey, Function.identity(), (a, b) -> a, HashMap::new));

        Set<String> incomingKeys = new HashSet<>();
        List<StoreProduct> toInsert = new ArrayList<>();
        List<StoreProduct> toUpdate = new ArrayList<>();
        List<StoreProduct> toMarkDeleted = new ArrayList<>();
        Instant now = Instant.now();

        for (CoupangCommerceProductService.CoupangSyncItem item : remoteItems) {
            String key = makeKey(item);
            incomingKeys.add(key);

            StoreProduct target = existingMap.get(key);
            if (target == null) {
                StoreProduct created = toStoreProduct(store, item, now);
                toInsert.add(created);
                continue;
            }
            if (isChanged(target, item)) {
                apply(target, item, now);
                toUpdate.add(target);
            }
        }

        for (StoreProduct old : existing) {
            String key = makeKey(old);
            if (!incomingKeys.contains(key) && !"DELETED".equals(old.getStatusType())) {
                old.setStatusType("DELETED");
                old.setSyncedAt(now);
                toMarkDeleted.add(old);
            }
        }

        if (!toInsert.isEmpty()) {
            storeProductRepository.saveAll(toInsert);
        }
        if (!toUpdate.isEmpty()) {
            storeProductRepository.saveAll(toUpdate);
        }
        if (!toMarkDeleted.isEmpty()) {
            storeProductRepository.saveAll(toMarkDeleted);
        }

        log.info("[쿠팡 동기화] 완료 storeUid={}, 조회={}, 신규={}, 수정={}, 삭제표시={}",
                storeUid, remoteItems.size(), toInsert.size(), toUpdate.size(), toMarkDeleted.size());

        return new SyncResult(remoteItems.size(), toInsert.size(), toUpdate.size(), toMarkDeleted.size());
    }

    private StoreProduct toStoreProduct(Store store, CoupangCommerceProductService.CoupangSyncItem src, Instant syncedAt) {
        StoreProduct p = new StoreProduct();
        p.setStore(store);
        apply(p, src, syncedAt);
        if (p.getSellerProductId() == null || p.getSellerProductId().isBlank()) {
            p.setSellerProductId("(unknown)");
        }
        return p;
    }

    private void apply(StoreProduct target, CoupangCommerceProductService.CoupangSyncItem src, Instant now) {
        target.setSellerProductId(src.getSellerProductId() != null ? src.getSellerProductId().trim() : "");
        target.setVendorItemId(src.getVendorItemId() != null && !src.getVendorItemId().isBlank() ? src.getVendorItemId().trim() : "");
        target.setProductName(src.getProductName());
        target.setOptionName(src.getOptionName());
        target.setSalePrice(src.getSalePrice() != null ? BigDecimal.valueOf(src.getSalePrice()) : null);
        target.setOriginalPrice(src.getOriginalPrice() != null ? BigDecimal.valueOf(src.getOriginalPrice()) : null);
        target.setStockQuantity(src.getStockQuantity());
        target.setStatusType(src.getStatusType());
        target.setImageUrl(src.getImageUrl());
        target.setCategoryId(src.getCategoryId());
        target.setSyncedAt(now);
    }

    private boolean isChanged(StoreProduct old, CoupangCommerceProductService.CoupangSyncItem src) {
        return !Objects.equals(old.getSellerProductId(), nvl(src.getSellerProductId()))
                || !Objects.equals(old.getVendorItemId(), nvl(src.getVendorItemId()))
                || !Objects.equals(old.getProductName(), src.getProductName())
                || !Objects.equals(old.getOptionName(), src.getOptionName())
                || !equalsBigDecimal(old.getSalePrice(), src.getSalePrice())
                || !equalsBigDecimal(old.getOriginalPrice(), src.getOriginalPrice())
                || !Objects.equals(old.getStockQuantity(), src.getStockQuantity())
                || !Objects.equals(old.getStatusType(), src.getStatusType())
                || !Objects.equals(old.getImageUrl(), src.getImageUrl())
                || !Objects.equals(old.getCategoryId(), src.getCategoryId());
    }

    private static boolean equalsBigDecimal(BigDecimal a, Long b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.compareTo(BigDecimal.valueOf(b)) == 0;
    }

    private String makeKey(CoupangCommerceProductService.CoupangSyncItem item) {
        if (item.getVendorItemId() != null && !item.getVendorItemId().isBlank()) {
            return "V:" + item.getVendorItemId().trim();
        }
        return "S:" + nvl(item.getSellerProductId()) + "|O:" + nvl(item.getOptionName());
    }

    private String makeKey(StoreProduct item) {
        if (item.getVendorItemId() != null && !item.getVendorItemId().isBlank()) {
            return "V:" + item.getVendorItemId().trim();
        }
        return "S:" + nvl(item.getSellerProductId()) + "|O:" + nvl(item.getOptionName());
    }

    private static String nvl(String value) {
        return value == null ? "" : value;
    }

    public record SyncResult(int totalFetched, int inserted, int updated, int markedDeleted) {}
}
