package com.sellerhelper.service.coupang;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sellerhelper.entity.Store;
import com.sellerhelper.entity.StoreAuth;
import com.sellerhelper.exception.ResourceNotFoundException;
import com.sellerhelper.repository.StoreAuthRepository;
import com.sellerhelper.repository.StoreRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 쿠팡 오픈 API 전담.
 * 목록 API로 sellerProductId 수집 → 상세 API로 items[].vendorItemId 단위 펼침.
 *
 * @see <a href="https://developers.coupangcorp.com/hc/ko/articles/360033645034">상품 목록 페이징 조회</a>
 * @see <a href="https://developers.coupangcorp.com/hc/ko/articles/360033644994">상품 조회</a>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CoupangCommerceProductService {

    private final StoreRepository storeRepository;
    private final StoreAuthRepository storeAuthRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * 쿠팡 전체 상품 조회 (동기화용).
     * 목록 API로 sellerProductId 수집 후, 상세 API로 옵션(vendorItemId) 단위 펼침.
     */
    @Transactional(readOnly = true)
    public List<CoupangSyncItem> fetchAllProductDetails(Long storeUid) {
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        validateCoupangStore(store);

        StoreAuth auth = storeAuthRepository.findByStore_Uid(storeUid)
                .orElseThrow(() -> new IllegalArgumentException("API 인증 정보가 없습니다. 스토어 연동을 먼저 진행해 주세요."));
        String vendorId = requireVendorId(store);

        List<CoupangSyncItem> result = new ArrayList<>();
        String nextToken = null;

        try {
            while (true) {
                CoupangProductListResponse page = requestProductList(auth, vendorId, 100, nextToken);
                if (page == null || page.getData() == null || page.getData().isEmpty()) {
                    break;
                }
                for (CoupangProductListItem listItem : page.getData()) {
                    List<CoupangSyncItem> detailItems = fetchProductDetailItems(auth, listItem);
                    result.addAll(detailItems);
                }
                nextToken = page.getNextToken();
                if (nextToken == null || nextToken.isBlank()) {
                    break;
                }
            }
            log.info("[쿠팡 API] 상품 전체 조회 완료 storeUid={}, totalItems={}", storeUid, result.size());
            return result;
        } catch (HttpClientErrorException e) {
            throw toKoreanException(e, "쿠팡 상품 조회");
        } catch (Exception e) {
            log.error("[쿠팡 API] 상품 전체 조회 실패 storeUid={}", storeUid, e);
            throw new IllegalStateException("쿠팡 상품 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
    }

    /**
     * 화면 조회용. nextToken 방식이라 요청 page까지 순차 탐색.
     */
    @Transactional(readOnly = true)
    public List<CoupangSyncItem> getPagedProducts(Long storeUid, int page, int size) {
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        validateCoupangStore(store);

        StoreAuth auth = storeAuthRepository.findByStore_Uid(storeUid)
                .orElseThrow(() -> new IllegalArgumentException("API 인증 정보가 없습니다. 스토어 연동을 먼저 진행해 주세요."));
        String vendorId = requireVendorId(store);
        int safePage = Math.max(1, page);
        int safeSize = Math.min(100, Math.max(1, size));

        try {
            String nextToken = null;
            CoupangProductListResponse current = null;
            for (int i = 1; i <= safePage; i++) {
                current = requestProductList(auth, vendorId, safeSize, nextToken);
                if (current == null || current.getData() == null || current.getData().isEmpty()) {
                    return Collections.emptyList();
                }
                nextToken = current.getNextToken();
            }
            List<CoupangSyncItem> result = new ArrayList<>();
            for (CoupangProductListItem listItem : current.getData()) {
                result.addAll(fetchProductDetailItems(auth, listItem));
            }
            return result;
        } catch (HttpClientErrorException e) {
            throw toKoreanException(e, "쿠팡 상품 목록 조회");
        } catch (Exception e) {
            log.error("[쿠팡 API] 상품 목록 조회 실패 storeUid={}, page={}, size={}", storeUid, page, size, e);
            throw new IllegalStateException("쿠팡 상품 목록 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
    }

    /**
     * 단건 상세 조회 (sellerProductId 기준, 옵션 목록 반환).
     */
    @Transactional(readOnly = true)
    public List<CoupangSyncItem> getProductDetail(Long storeUid, String sellerProductId) {
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        validateCoupangStore(store);

        StoreAuth auth = storeAuthRepository.findByStore_Uid(storeUid)
                .orElseThrow(() -> new IllegalArgumentException("API 인증 정보가 없습니다. 스토어 연동을 먼저 진행해 주세요."));

        try {
            long id = Long.parseLong(sellerProductId);
            CoupangProductListItem fakeListItem = new CoupangProductListItem();
            fakeListItem.setSellerProductId(id);
            fakeListItem.setSellerProductName(null);
            fakeListItem.setDisplayCategoryCode(null);
            fakeListItem.setStatusName(null);
            return fetchProductDetailItems(auth, fakeListItem);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("상품 ID는 숫자여야 합니다.");
        } catch (HttpClientErrorException e) {
            throw toKoreanException(e, "쿠팡 상품 상세 조회");
        } catch (Exception e) {
            log.error("[쿠팡 API] 상품 상세 조회 실패 storeUid={}, sellerProductId={}", storeUid, sellerProductId, e);
            throw new IllegalStateException("쿠팡 상품 상세 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
    }

    private List<CoupangSyncItem> fetchProductDetailItems(StoreAuth auth, CoupangProductListItem listItem) {
        String sellerProductId = String.valueOf(listItem.getSellerProductId());
        CoupangProductDetailResponse detail = requestProductDetail(auth, sellerProductId);

        if (detail == null || detail.getItems() == null || detail.getItems().isEmpty()) {
            return Collections.singletonList(CoupangSyncItem.builder()
                    .sellerProductId(sellerProductId)
                    .vendorItemId(null)
                    .productName(listItem.getSellerProductName())
                    .optionName(null)
                    .salePrice(null)
                    .originalPrice(null)
                    .stockQuantity(null)
                    .statusType(listItem.getStatusName())
                    .imageUrl(null)
                    .categoryId(listItem.getDisplayCategoryCode() != null ? String.valueOf(listItem.getDisplayCategoryCode()) : null)
                    .rawPayload(toRawPayloadForListOnly(listItem, sellerProductId))
                    .build());
        }

        String productName = nvl(detail.getDisplayProductName(), detail.getSellerProductName(), listItem.getSellerProductName());
        String statusName = nvl(detail.getStatusName(), listItem.getStatusName());
        String categoryId = detail.getDisplayCategoryCode() != null
                ? String.valueOf(detail.getDisplayCategoryCode())
                : (listItem.getDisplayCategoryCode() != null ? String.valueOf(listItem.getDisplayCategoryCode()) : null);
        String defaultImageUrl = getRepresentativeImageUrl(detail.getImages());

        List<CoupangSyncItem> items = new ArrayList<>();
        for (CoupangProductItemOption opt : detail.getItems()) {
            String imageUrl = getRepresentativeImageUrl(opt.getImages());
            if (imageUrl == null) {
                imageUrl = defaultImageUrl;
            }
            // 재고: sellableQuantity(판매가능수량) 사용. maximumBuyCount는 1회 최대 구매 수량이라 재고와 다름
            Integer stockQty = opt.getSellableQuantity();
            items.add(CoupangSyncItem.builder()
                    .sellerProductId(sellerProductId)
                    .vendorItemId(opt.getVendorItemId() != null ? String.valueOf(opt.getVendorItemId()) : null)
                    .productName(productName)
                    .optionName(opt.getItemName())
                    .salePrice(opt.getSalePrice() != null ? opt.getSalePrice().longValue() : null)
                    .originalPrice(opt.getOriginalPrice() != null ? opt.getOriginalPrice().longValue() : null)
                    .stockQuantity(stockQty)
                    .statusType(statusName)
                    .imageUrl(imageUrl)
                    .categoryId(categoryId)
                    .rawPayload(toRawPayload(listItem, detail, opt, sellerProductId, productName, imageUrl, categoryId, statusName))
                    .build());
        }
        return items;
    }

    private String toRawPayload(CoupangProductListItem listItem,
                                CoupangProductDetailResponse detail,
                                CoupangProductItemOption option,
                                String sellerProductId,
                                String productName,
                                String imageUrl,
                                String categoryId,
                                String statusName) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sellerProductId", sellerProductId);
        payload.put("vendorItemId", option.getVendorItemId() != null ? String.valueOf(option.getVendorItemId()) : null);
        payload.put("productName", productName);
        payload.put("optionName", option.getItemName());
        payload.put("salePrice", option.getSalePrice());
        payload.put("originalPrice", option.getOriginalPrice());
        payload.put("stockQuantity", option.getSellableQuantity());
        payload.put("statusType", statusName);
        payload.put("imageUrl", imageUrl);
        payload.put("categoryId", categoryId);
        payload.put("raw", Map.of(
                "listItem", listItem,
                "detail", detail,
                "option", option
        ));
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            log.warn("쿠팡 상품 raw payload 직렬화 실패: {}", e.getMessage());
            return "{}";
        }
    }

    private String toRawPayloadForListOnly(CoupangProductListItem listItem, String sellerProductId) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sellerProductId", sellerProductId);
        payload.put("vendorItemId", null);
        payload.put("productName", listItem.getSellerProductName());
        payload.put("optionName", null);
        payload.put("salePrice", null);
        payload.put("originalPrice", null);
        payload.put("stockQuantity", null);
        payload.put("statusType", listItem.getStatusName());
        payload.put("imageUrl", null);
        payload.put("categoryId", listItem.getDisplayCategoryCode() != null ? String.valueOf(listItem.getDisplayCategoryCode()) : null);
        payload.put("raw", Map.of("listItem", listItem));
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            log.warn("쿠팡 상품 raw payload(목록 전용) 직렬화 실패: {}", e.getMessage());
            return "{}";
        }
    }

    private CoupangProductListResponse requestProductList(StoreAuth auth, String vendorId, int maxPerPage, String nextToken) {
        StringBuilder query = new StringBuilder();
        query.append("vendorId=").append(vendorId).append("&maxPerPage=").append(maxPerPage);
        if (nextToken != null && !nextToken.isBlank()) {
            query.append("&nextToken=").append(nextToken);
        }
        String path = CoupangApiConstants.PATH_SELLER_PRODUCTS;
        String authHeader = CoupangHmacSigner.createAuthorizationHeader(
                auth.getApiKey(), auth.getApiSecret(), "GET", path, query.toString());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        String url = CoupangApiConstants.BASE_URL + path + "?" + query;
        ResponseEntity<CoupangProductListResponse> response = restTemplate.exchange(
                url, HttpMethod.GET, new HttpEntity<>(headers), CoupangProductListResponse.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            return null;
        }
        return response.getBody();
    }

    private CoupangProductDetailResponse requestProductDetail(StoreAuth auth, String sellerProductId) {
        String path = CoupangApiConstants.PATH_SELLER_PRODUCTS + "/" + sellerProductId;
        String authHeader = CoupangHmacSigner.createAuthorizationHeader(
                auth.getApiKey(), auth.getApiSecret(), "GET", path, "");

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        String url = CoupangApiConstants.BASE_URL + path;
        ResponseEntity<CoupangProductDetailWrapper> response = restTemplate.exchange(
                url, HttpMethod.GET, new HttpEntity<>(headers), CoupangProductDetailWrapper.class);

        CoupangProductDetailWrapper body = response.getBody();
        if (!response.getStatusCode().is2xxSuccessful() || body == null || body.getData() == null) {
            return null;
        }
        return body.getData();
    }

    private void validateCoupangStore(Store store) {
        if (store.getMall() == null || !"COUPANG".equalsIgnoreCase(store.getMall().getCode())) {
            throw new IllegalArgumentException("쿠팡 스토어만 처리할 수 있습니다.");
        }
    }

    private String requireVendorId(Store store) {
        String vendorId = store.getMallSellerId();
        if (vendorId == null || vendorId.isBlank()) {
            throw new IllegalArgumentException("쿠팡 판매자 ID(vendorId)가 등록되지 않았습니다. 스토어 설정에서 판매자 ID를 입력해 주세요.");
        }
        return vendorId;
    }

    private static String nvl(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v;
            }
        }
        return null;
    }

    /**
     * 쿠팡 상품 대표 이미지 URL 추출.
     * REPRESENTATION 타입 우선, 없으면 첫 번째 이미지. cdnPath 또는 vendorPath(전체 URL) 사용.
     */
    private static String getRepresentativeImageUrl(List<CoupangImage> images) {
        if (images == null || images.isEmpty()) {
            return null;
        }
        for (CoupangImage image : images) {
            if ("REPRESENTATION".equalsIgnoreCase(image.getImageType())) {
                String url = toImageUrl(image);
                if (url != null) return url;
            }
        }
        for (CoupangImage image : images) {
            String url = toImageUrl(image);
            if (url != null) return url;
        }
        return null;
    }

    private static String toImageUrl(CoupangImage image) {
        if (image.getCdnPath() != null && !image.getCdnPath().isBlank()) {
            String path = image.getCdnPath().startsWith("/") ? image.getCdnPath() : "/" + image.getCdnPath();
            return "https://image.coupang.com" + path;
        }
        if (image.getVendorPath() != null && !image.getVendorPath().isBlank()
                && (image.getVendorPath().startsWith("http://") || image.getVendorPath().startsWith("https://"))) {
            return image.getVendorPath().trim();
        }
        return null;
    }

    private static IllegalStateException toKoreanException(HttpClientErrorException e, String action) {
        int status = e.getStatusCode() != null ? e.getStatusCode().value() : 0;
        if (status == 400) {
            return new IllegalStateException(action + "에 실패했습니다. 요청값이 올바르지 않습니다. 판매자 ID, 상품 ID, nextToken 값을 확인해 주세요.");
        }
        if (status == 401) {
            return new IllegalStateException(action + "에 실패했습니다. 인증에 실패했습니다. Access Key와 Secret Key를 확인해 주세요.");
        }
        if (status == 403) {
            return new IllegalStateException(action + "에 실패했습니다. API 권한이 없거나 접근이 제한되었습니다. 권한 또는 IP 허용 설정을 확인해 주세요.");
        }
        if (status == 404) {
            return new IllegalStateException(action + "에 실패했습니다. 요청한 상품을 찾을 수 없습니다.");
        }
        if (status == 429) {
            return new IllegalStateException(action + "에 실패했습니다. 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.");
        }
        return new IllegalStateException(action + "에 실패했습니다. 쿠팡 API 오류가 발생했습니다. (HTTP " + status + ")");
    }

    // ===== DTO (목록 응답 / 상세 응답 분리) =====

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CoupangProductListResponse {
        private String code;
        private String message;
        private String nextToken;
        private List<CoupangProductListItem> data;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CoupangProductListItem {
        private Long sellerProductId;
        private String sellerProductName;
        private Long displayCategoryCode;
        private String statusName;
        private String vendorId;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CoupangProductDetailWrapper {
        private String code;
        private String message;
        private CoupangProductDetailResponse data;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CoupangProductDetailResponse {
        private Long sellerProductId;
        private String sellerProductName;
        private String displayProductName;
        private Long displayCategoryCode;
        private String statusName;
        private List<CoupangImage> images;
        private List<CoupangProductItemOption> items;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CoupangProductItemOption {
        private Long vendorItemId;
        private String itemName;
        private Long originalPrice;
        private Long salePrice;
        /** 1회 최대 구매 수량 (재고 아님) */
        private Integer maximumBuyCount;
        /** 판매 가능 재고 수량. 상품 조회 API 응답 필드 */
        private Integer sellableQuantity;
        private List<CoupangImage> images;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CoupangImage {
        private String imageType;
        private String cdnPath;
        private String vendorPath;
    }

    @Data
    @Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class CoupangSyncItem {
        private String sellerProductId;
        private String vendorItemId;
        private String productName;
        private String optionName;
        private Long salePrice;
        private Long originalPrice;
        private Integer stockQuantity;
        private String statusType;
        private String imageUrl;
        private String categoryId;
        private String rawPayload;

        public static CoupangSyncItem fromListOnly(CoupangProductListItem item) {
            return CoupangSyncItem.builder()
                    .sellerProductId(item.getSellerProductId() != null ? String.valueOf(item.getSellerProductId()) : null)
                    .vendorItemId(null)
                    .productName(item.getSellerProductName())
                    .optionName(null)
                    .salePrice(null)
                    .originalPrice(null)
                    .stockQuantity(null)
                    .statusType(item.getStatusName())
                    .imageUrl(null)
                    .categoryId(item.getDisplayCategoryCode() != null ? String.valueOf(item.getDisplayCategoryCode()) : null)
                    .rawPayload("{}")
                    .build();
        }
    }
}
