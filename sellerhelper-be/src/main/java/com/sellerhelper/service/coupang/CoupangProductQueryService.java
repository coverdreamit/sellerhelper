package com.sellerhelper.service.coupang;

import com.sellerhelper.dto.naver.NaverProductItem;
import com.sellerhelper.dto.naver.NaverProductSearchResult;
import com.sellerhelper.entity.StoreProduct;
import com.sellerhelper.repository.StoreProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * 쿠팡 상품 DB 조회 전담. 저장된 상품을 NaverProductItem / NaverProductSearchResult 로 변환해 반환.
 */
@Service
@RequiredArgsConstructor
public class CoupangProductQueryService {

    private final StoreProductRepository storeProductRepository;

    @Transactional(readOnly = true)
    public NaverProductSearchResult getStoredProducts(Long storeUid, int page, int size) {
        List<StoreProduct> all = storeProductRepository.findAllByStore_UidOrderByProductNameAscVendorItemIdAsc(storeUid);
        int totalCount = all.size();
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
        int from = Math.max(0, (page - 1) * size);
        int to = Math.min(all.size(), from + size);
        List<StoreProduct> pageList = from < to ? all.subList(from, to) : List.of();
        List<NaverProductItem> items = pageList.stream().map(this::toDto).toList();

        return NaverProductSearchResult.builder()
                .contents(items)
                .page(page)
                .size(size)
                .totalCount(totalCount)
                .lastSyncedAt(lastSyncedAt)
                .build();
    }

    @Transactional(readOnly = true)
    public NaverProductItem getStoredProduct(Long storeUid, String sellerProductId, String vendorItemId) {
        StoreProduct row;
        if (vendorItemId != null && !vendorItemId.isBlank()) {
            row = storeProductRepository.findByStore_UidAndVendorItemId(storeUid, vendorItemId)
                    .orElseThrow(() -> new IllegalArgumentException("해당 상품 옵션을 찾을 수 없습니다."));
        } else {
            row = storeProductRepository.findFirstByStore_UidAndSellerProductId(storeUid, sellerProductId)
                    .orElseThrow(() -> new IllegalArgumentException("해당 상품을 찾을 수 없습니다."));
        }
        return toDto(row);
    }

    private NaverProductItem toDto(StoreProduct row) {
        return NaverProductItem.builder()
                .channelProductNo(row.getSellerProductId())
                .vendorItemId(row.getVendorItemId() != null && !row.getVendorItemId().isEmpty() ? row.getVendorItemId() : null)
                .productName(row.getProductName())
                .optionName(row.getOptionName())
                .salePrice(row.getSalePrice() != null ? row.getSalePrice().longValue() : null)
                .originalPrice(row.getOriginalPrice() != null ? row.getOriginalPrice().longValue() : null)
                .stockQuantity(row.getStockQuantity())
                .statusType(row.getStatusType())
                .representativeImageUrl(row.getImageUrl())
                .leafCategoryId(row.getCategoryId())
                .build();
    }
}
