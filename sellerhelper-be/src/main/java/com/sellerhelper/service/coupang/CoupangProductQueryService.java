package com.sellerhelper.service.coupang;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public NaverProductSearchResult getStoredProducts(Long storeUid, int page, int size) {
        List<StoreProduct> all =
                storeProductRepository.findAllByStore_UidOrderBySellerProductIdAscVendorItemIdAscWithVendor(storeUid);
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
        JsonNode raw = readRawPayload(row.getRawPayload());
        JsonNode productNode = extractProductNode(raw);
        return NaverProductItem.builder()
                .channelProductNo(firstNonBlank(
                        readString(raw, "sellerProductId", null),
                        readString(productNode, "channelProductNo", null),
                        row.getSellerProductId()))
                .vendorItemId(readNullableString(raw, "vendorItemId", row.getVendorItemId()))
                .productName(firstNonBlank(
                        readString(raw, "productName", null),
                        readString(productNode, "name", null),
                        readString(productNode, "sellerProductName", null)))
                .optionName(readString(raw, "optionName", null))
                .salePrice(firstNonNull(readLong(raw, "salePrice", null), readLong(productNode, "salePrice", null)))
                .originalPrice(readLong(raw, "originalPrice", null))
                .stockQuantity(firstNonNull(readInteger(raw, "stockQuantity", null), readInteger(productNode, "stockQuantity", null)))
                .statusType(firstNonBlank(
                        readString(raw, "statusType", null),
                        readString(productNode, "statusType", null),
                        row.getStatusType()))
                .representativeImageUrl(firstNonBlank(
                        readString(raw, "imageUrl", null),
                        readString(childNode(productNode, "representativeImage"), "url", null)))
                .leafCategoryId(firstNonBlank(
                        readString(raw, "categoryId", null),
                        readString(productNode, "categoryId", null)))
                .rawPayload(row.getRawPayload())
                .storeProductUid(row.getUid())
                .assignedVendorUid(row.getAssignedVendor() != null ? row.getAssignedVendor().getUid() : null)
                .assignedVendorName(row.getAssignedVendor() != null ? row.getAssignedVendor().getVendorName() : null)
                .build();
    }

    private JsonNode readRawPayload(String rawPayload) {
        if (rawPayload == null || rawPayload.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readTree(rawPayload);
        } catch (Exception e) {
            return null;
        }
    }

    private static String readString(JsonNode root, String field, String fallback) {
        if (root == null) {
            return fallback;
        }
        JsonNode node = root.get(field);
        if (node == null || node.isNull()) {
            return fallback;
        }
        return node.asText(fallback);
    }

    private static String readNullableString(JsonNode root, String field, String fallback) {
        String value = readString(root, field, fallback);
        if (value == null || value.isBlank()) {
            return null;
        }
        return value;
    }

    private static Long readLong(JsonNode root, String field, Long fallback) {
        if (root == null) {
            return fallback;
        }
        JsonNode node = root.get(field);
        if (node == null || node.isNull()) {
            return fallback;
        }
        if (node.isNumber()) {
            return node.longValue();
        }
        String text = node.asText(null);
        if (text == null || text.isBlank()) {
            return fallback;
        }
        try {
            return Long.parseLong(text);
        } catch (NumberFormatException e) {
            return fallback;
        }
    }

    private static Integer readInteger(JsonNode root, String field, Integer fallback) {
        Long longVal = readLong(root, field, null);
        if (longVal != null) {
            return longVal.intValue();
        }
        return fallback;
    }

    private static JsonNode extractProductNode(JsonNode raw) {
        if (raw == null) {
            return null;
        }
        JsonNode channelProduct = raw.get("channelProduct");
        return (channelProduct != null && !channelProduct.isNull()) ? channelProduct : raw;
    }

    private static JsonNode childNode(JsonNode parent, String field) {
        if (parent == null) {
            return null;
        }
        JsonNode child = parent.get(field);
        return child != null && !child.isNull() ? child : null;
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private static <T> T firstNonNull(T a, T b) {
        return a != null ? a : b;
    }
}
