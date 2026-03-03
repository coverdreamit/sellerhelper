package com.sellerhelper.service;

import com.sellerhelper.dto.naver.NaverProductItem;
import com.sellerhelper.dto.naver.NaverProductSearchResult;
import com.sellerhelper.entity.Company;
import com.sellerhelper.entity.Store;
import com.sellerhelper.entity.StoreProduct;
import com.sellerhelper.entity.User;
import com.sellerhelper.exception.ResourceNotFoundException;
import com.sellerhelper.repository.StoreProductRepository;
import com.sellerhelper.repository.StoreRepository;
import com.sellerhelper.repository.UserRepository;
import com.sellerhelper.service.coupang.CoupangCommerceProductService;
import com.sellerhelper.service.naver.NaverCommerceProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/** 스토어별 상품목록 조회. 모든 플랫폼(네이버/쿠팡 등) 공통으로 DB 저장분 조회. */
@Service
@RequiredArgsConstructor
public class StoreProductService {

    private static final String[] SYNC_SUPPORTED_MALLS = { "NAVER", "COUPANG" };

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final StoreProductRepository storeProductRepository;
    private final NaverCommerceProductService naverProductService;
    private final CoupangCommerceProductService coupangProductService;

    /**
     * 내 스토어 상품목록 조회 (본인 회사 스토어만).
     * 모든 플랫폼 공통: DB 저장분 페이징 조회. 동기화 미실행 시 빈 목록.
     */
    @Transactional(readOnly = true)
    public NaverProductSearchResult getMyStoreProducts(Long userUid, Long storeUid, int page, int size) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new ResourceNotFoundException("User", userUid));
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));

        Company userCompany = user.getCompany();
        if (userCompany == null || store.getCompany() == null
                || !store.getCompany().getUid().equals(userCompany.getUid())) {
            throw new IllegalArgumentException("해당 스토어의 상품을 조회할 권한이 없습니다.");
        }

        return getStoreProductsFromDb(store, page, size);
    }

    /** 스토어 상품 목록 DB 조회 (페이징, 플랫폼 공통) */
    private NaverProductSearchResult getStoreProductsFromDb(Store store, int page, int size) {
        long storeUid = store.getUid();
        long totalCount = storeProductRepository.countByStore_Uid(storeUid);
        Instant lastSyncedAt = null;
        StoreProduct lastSync = storeProductRepository.findTop1ByStore_UidOrderBySyncedAtDesc(storeUid);
        if (lastSync != null) {
            lastSyncedAt = lastSync.getSyncedAt();
        }
        if (totalCount == 0) {
            return NaverProductSearchResult.builder()
                    .contents(List.of())
                    .page(page)
                    .size(size)
                    .totalCount(0)
                    .lastSyncedAt(lastSyncedAt)
                    .build();
        }
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), Math.max(1, Math.min(100, size)),
                Sort.by("productName", "vendorItemId"));
        List<NaverProductItem> contents = storeProductRepository
                .findByStore_UidOrderByProductNameAscVendorItemIdAsc(storeUid, pageable)
                .stream()
                .map(this::toNaverProductItem)
                .collect(Collectors.toList());
        return NaverProductSearchResult.builder()
                .contents(contents)
                .page(page)
                .size(size)
                .totalCount((int) totalCount)
                .lastSyncedAt(lastSyncedAt)
                .build();
    }

    private NaverProductItem toNaverProductItem(StoreProduct p) {
        return NaverProductItem.builder()
                .channelProductNo(p.getSellerProductId())
                .vendorItemId(p.getVendorItemId().isEmpty() ? null : p.getVendorItemId())
                .productName(p.getProductName())
                .optionName(p.getOptionName())
                .salePrice(p.getSalePrice() != null ? p.getSalePrice().longValue() : null)
                .originalPrice(p.getOriginalPrice() != null ? p.getOriginalPrice().longValue() : null)
                .stockQuantity(p.getStockQuantity())
                .statusType(p.getStatusType())
                .representativeImageUrl(p.getImageUrl())
                .leafCategoryId(p.getCategoryId())
                .build();
    }

    /**
     * 스토어 상품 목록 동기화: 플랫폼 API에서 전체 조회 후 DB에 저장(기존 데이터 교체).
     * 네이버·쿠팡 지원. 추가 플랫폼은 SYNC_SUPPORTED_MALLS 및 분기 추가.
     */
    @Transactional
    public void syncStoreProducts(Long userUid, Long storeUid) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new ResourceNotFoundException("User", userUid));
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        Company userCompany = user.getCompany();
        if (userCompany == null || store.getCompany() == null
                || !store.getCompany().getUid().equals(userCompany.getUid())) {
            throw new IllegalArgumentException("해당 스토어의 상품을 동기화할 권한이 없습니다.");
        }
        String mallCode = store.getMall() != null ? store.getMall().getCode() : null;
        if (mallCode == null || mallCode.isBlank()) {
            throw new IllegalArgumentException("스토어의 플랫폼 정보가 없습니다.");
        }
        List<NaverProductItem> items;
        if ("NAVER".equalsIgnoreCase(mallCode)) {
            items = naverProductService.fetchAllProductsForSync(storeUid);
        } else if ("COUPANG".equalsIgnoreCase(mallCode)) {
            items = coupangProductService.fetchAllProductsForSync(storeUid);
        } else {
            throw new IllegalArgumentException("해당 플랫폼(" + mallCode + ")은 상품 목록 동기화를 지원하지 않습니다.");
        }
        Instant syncedAt = Instant.now();
        storeProductRepository.deleteByStore_Uid(storeUid);
        List<StoreProduct> toSave = items.stream()
                .map(item -> toStoreProduct(store, item, syncedAt))
                .collect(Collectors.toList());
        storeProductRepository.saveAll(toSave);
    }

    private StoreProduct toStoreProduct(Store store, NaverProductItem item, Instant syncedAt) {
        String vendorItemId = item.getVendorItemId() != null && !item.getVendorItemId().isBlank()
                ? item.getVendorItemId().trim() : "";
        String sellerProductId = item.getChannelProductNo() != null ? item.getChannelProductNo().trim() : "";
        if (sellerProductId.isEmpty()) {
            sellerProductId = "(unknown)";
        }
        return StoreProduct.builder()
                .store(store)
                .sellerProductId(sellerProductId)
                .vendorItemId(vendorItemId)
                .productName(item.getProductName())
                .optionName(item.getOptionName())
                .salePrice(item.getSalePrice() != null ? BigDecimal.valueOf(item.getSalePrice()) : null)
                .originalPrice(item.getOriginalPrice() != null ? BigDecimal.valueOf(item.getOriginalPrice()) : null)
                .stockQuantity(item.getStockQuantity())
                .statusType(item.getStatusType())
                .imageUrl(item.getRepresentativeImageUrl())
                .categoryId(item.getLeafCategoryId())
                .syncedAt(syncedAt)
                .build();
    }

    /**
     * 내 스토어 상품 단건 조회 (쿠팡: sellerProductId, 네이버: 미지원 시 null)
     */
    @Transactional(readOnly = true)
    public NaverProductItem getMyStoreProduct(Long userUid, Long storeUid, String productId) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new ResourceNotFoundException("User", userUid));
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));

        Company userCompany = user.getCompany();
        if (userCompany == null || store.getCompany() == null
                || !store.getCompany().getUid().equals(userCompany.getUid())) {
            throw new IllegalArgumentException("해당 스토어의 상품을 조회할 권한이 없습니다.");
        }

        String mallCode = store.getMall() != null ? store.getMall().getCode() : null;
        if ("COUPANG".equalsIgnoreCase(mallCode)) {
            return coupangProductService.getProduct(storeUid, productId);
        }
        return null;
    }
}
