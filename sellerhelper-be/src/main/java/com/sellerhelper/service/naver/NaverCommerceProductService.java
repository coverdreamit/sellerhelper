package com.sellerhelper.service.naver;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.sellerhelper.dto.naver.NaverProductItem;
import com.sellerhelper.dto.naver.NaverProductSearchResult;
import com.sellerhelper.entity.Store;
import com.sellerhelper.entity.StoreAuth;
import com.sellerhelper.exception.ResourceNotFoundException;
import com.sellerhelper.repository.StoreAuthRepository;
import com.sellerhelper.repository.StoreRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 네이버 스마트스토어(커머스) API - 상품목록 조회
 * @see https://api.commerce.naver.com/external/v1/products/search
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NaverCommerceProductService {

    private static final String PRODUCT_SEARCH_URL = "https://api.commerce.naver.com/external/v1/products/search";
    private static final String PRODUCT_DETAIL_URL = "https://api.commerce.naver.com/external/v2/products/channel-products/{channelProductNo}";

    private final StoreRepository storeRepository;
    private final StoreAuthRepository storeAuthRepository;
    private final NaverCommerceTokenService tokenService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * 네이버 스토어의 상품목록 조회 (페이징)
     *
     * @param storeUid 스토어 UID
     * @param page     페이지 (1부터)
     * @param size     페이지당 개수 (기본 20, 최대 100)
     */
    @Transactional(readOnly = true)
    public NaverProductSearchResult getProductList(Long storeUid, int page, int size) {
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        if (!"NAVER".equalsIgnoreCase(store.getMall() != null ? store.getMall().getCode() : null)) {
            throw new IllegalArgumentException("네이버 스토어만 상품목록 조회가 가능합니다.");
        }
        StoreAuth auth = storeAuthRepository.findByStore_Uid(storeUid)
                .orElseThrow(() -> new IllegalArgumentException("API 인증 정보가 없습니다. 스토어 연동을 먼저 진행해 주세요."));

        String token = tokenService.getOrRefreshToken(store, auth);

        int safePage = Math.max(1, page);
        int safeSize = Math.min(100, Math.max(1, size));

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            headers.set("Accept", "application/json;charset=UTF-8");
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

            ProductSearchRequest requestBody = new ProductSearchRequest(safePage, safeSize);
            HttpEntity<ProductSearchRequest> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<ProductSearchApiResponse> response = restTemplate.exchange(
                    PRODUCT_SEARCH_URL,
                    HttpMethod.POST,
                    request,
                    ProductSearchApiResponse.class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return NaverProductSearchResult.empty(safePage, safeSize);
            }

            ProductSearchApiResponse body = response.getBody();
            List<NaverProductItem> items = flattenToProductItems(body, response.getBody());

            return NaverProductSearchResult.builder()
                    .contents(items)
                    .page(safePage)
                    .size(safeSize)
                    .totalCount(body.getTotalCount() != null ? body.getTotalCount() : items.size())
                    .build();
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            int status = e.getStatusCode() != null ? e.getStatusCode().value() : 0;
            String safe = status == 403 ? "상품목록 조회에 실패했습니다. (403 접근 거부 - API 키·권한을 확인하세요.)"
                    : status == 401 ? "상품목록 조회에 실패했습니다. (401 인증 실패 - 연동 테스트를 다시 진행하세요.)"
                    : "상품목록 조회에 실패했습니다. (HTTP " + status + ")";
            log.warn("네이버 상품목록 조회 실패 storeUid={}, status={}", storeUid, e.getStatusCode());
            throw new IllegalStateException(safe);
        } catch (Exception e) {
            log.warn("네이버 상품목록 조회 실패 storeUid={}: {}", storeUid, e.getMessage());
            throw new IllegalStateException("상품목록 조회에 실패했습니다. 잠시 후 다시 시도하세요.");
        }
    }

    /**
     * 네이버 상품 전체 조회 (DB 동기화용). 페이지 단위로 모두 수집.
     */
    @Transactional(readOnly = true)
    public List<NaverProductItem> fetchAllProductsForSync(Long storeUid) {
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        if (!"NAVER".equalsIgnoreCase(store.getMall() != null ? store.getMall().getCode() : null)) {
            throw new IllegalArgumentException("네이버 스토어만 상품 동기화가 가능합니다.");
        }
        StoreAuth auth = storeAuthRepository.findByStore_Uid(storeUid)
                .orElseThrow(() -> new IllegalArgumentException("API 인증 정보가 없습니다. 스토어 연동을 먼저 진행해 주세요."));

        String token = tokenService.getOrRefreshToken(store, auth);
        List<NaverProductItem> allItems = new ArrayList<>();
        int page = 1;
        int size = 100;

        try {
            while (true) {
                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", "Bearer " + token);
                headers.set("Accept", "application/json;charset=UTF-8");
                headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
                ProductSearchRequest requestBody = new ProductSearchRequest(page, size);
                HttpEntity<ProductSearchRequest> request = new HttpEntity<>(requestBody, headers);
                ResponseEntity<ProductSearchApiResponse> response = restTemplate.exchange(
                        PRODUCT_SEARCH_URL, HttpMethod.POST, request, ProductSearchApiResponse.class);

                if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                    log.warn("네이버 상품 동기화 조회 실패 storeUid={}, page={}, status={}",
                            storeUid, page, response.getStatusCode());
                    break;
                }
                ProductSearchApiResponse body = response.getBody();
                List<NaverProductItem> items = flattenToProductItems(body, response.getBody());
                if (items.isEmpty()) {
                    break;
                }
                List<NaverProductItem> enriched = enrichWithDetail(storeUid, token, items);
                allItems.addAll(enriched);
                int totalCount = body.getTotalCount() != null ? body.getTotalCount() : 0;
                if (totalCount <= 0 || allItems.size() >= totalCount || items.size() < size) {
                    break;
                }
                page++;
            }
            return allItems;
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            int status = e.getStatusCode() != null ? e.getStatusCode().value() : 0;
            String safe = status == 403 ? "상품 목록 동기화에 실패했습니다. (403 접근 거부)"
                    : status == 401 ? "상품 목록 동기화에 실패했습니다. (401 인증 실패)"
                    : "상품 목록 동기화에 실패했습니다. (HTTP " + status + ")";
            log.warn("네이버 상품 동기화 실패 storeUid={}, status={}", storeUid, e.getStatusCode());
            throw new IllegalStateException(safe);
        } catch (Exception e) {
            log.warn("네이버 상품 동기화 실패 storeUid={}: {}", storeUid, e.getMessage());
            throw new IllegalStateException("상품 목록 동기화에 실패했습니다. 잠시 후 다시 시도하세요.");
        }
    }

    private List<NaverProductItem> enrichWithDetail(Long storeUid, String token, List<NaverProductItem> items) {
        if (items == null || items.isEmpty()) {
            return List.of();
        }
        List<NaverProductItem> result = new ArrayList<>(items.size());
        for (NaverProductItem item : items) {
            if (item == null || item.getChannelProductNo() == null || item.getChannelProductNo().isBlank()) {
                result.add(item);
                continue;
            }
            String detailRaw = fetchProductDetailRaw(storeUid, token, item.getChannelProductNo());
            if (detailRaw == null || detailRaw.isBlank()) {
                result.add(item);
                continue;
            }
            NaverProductItem merged = NaverProductItem.builder()
                    .channelProductNo(item.getChannelProductNo())
                    .vendorItemId(item.getVendorItemId())
                    .productName(item.getProductName())
                    .optionName(item.getOptionName())
                    .salePrice(item.getSalePrice())
                    .originalPrice(item.getOriginalPrice())
                    .stockQuantity(item.getStockQuantity())
                    .statusType(item.getStatusType())
                    .representativeImageUrl(item.getRepresentativeImageUrl())
                    .leafCategoryId(item.getLeafCategoryId())
                    .rawPayload(mergeRawPayload(item.getRawPayload(), detailRaw))
                    .build();
            result.add(merged);
        }
        return result;
    }

    private String fetchProductDetailRaw(Long storeUid, String token, String channelProductNo) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            headers.set("Accept", "application/json;charset=UTF-8");
            HttpEntity<Void> request = new HttpEntity<>(headers);
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    PRODUCT_DETAIL_URL,
                    HttpMethod.GET,
                    request,
                    JsonNode.class,
                    channelProductNo
            );
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return null;
            }
            return response.getBody().toString();
        } catch (Exception e) {
            log.warn("네이버 상품 상세 조회 실패 storeUid={}, channelProductNo={}, reason={}",
                    storeUid, channelProductNo, e.getMessage());
            return null;
        }
    }

    private String mergeRawPayload(String listRawPayload, String detailRawPayload) {
        try {
            JsonNode listNode = listRawPayload != null && !listRawPayload.isBlank()
                    ? objectMapper.readTree(listRawPayload)
                    : objectMapper.createObjectNode();
            JsonNode detailNode = detailRawPayload != null && !detailRawPayload.isBlank()
                    ? objectMapper.readTree(detailRawPayload)
                    : objectMapper.createObjectNode();
            ObjectNode merged = objectMapper.createObjectNode();
            if (listNode != null && listNode.isObject()) {
                merged.setAll((ObjectNode) listNode);
            } else {
                merged.set("listPayload", listNode);
            }
            merged.set("detailPayload", detailNode);
            return merged.toString();
        } catch (Exception e) {
            return listRawPayload;
        }
    }

    /**
     * API 응답 구조: contents[] 안에 channelProducts[] 가 있음.
     * contents[].channelProducts[] 를 평탄화하여 NaverProductItem 리스트로 변환.
     */
    private List<NaverProductItem> flattenToProductItems(ProductSearchApiResponse body, Object rawBodyObject) {
        if (body == null || body.getContents() == null) {
            return Collections.emptyList();
        }
        JsonNode rawRoot = objectMapper.valueToTree(rawBodyObject);
        List<NaverProductItem> result = new ArrayList<>();
        for (int rowIndex = 0; rowIndex < body.getContents().size(); rowIndex++) {
            ProductSearchContentRow row = body.getContents().get(rowIndex);
            if (row.getChannelProducts() == null) continue;
            for (int cpIndex = 0; cpIndex < row.getChannelProducts().size(); cpIndex++) {
                ChannelProduct cp = row.getChannelProducts().get(cpIndex);
                JsonNode rawChannelProductNode = rawRoot.path("contents").path(rowIndex).path("channelProducts").path(cpIndex);
                result.add(toProductItem(row, cp, rawChannelProductNode));
            }
        }
        return result;
    }

    private NaverProductItem toProductItem(ProductSearchContentRow row, ChannelProduct cp, JsonNode rawChannelProductNode) {
        if (cp == null) return NaverProductItem.empty();
        String imageUrl = cp.getRepresentativeImage() != null ? cp.getRepresentativeImage().getUrl() : null;
        String channelProductNo = cp.getChannelProductNo() != null ? String.valueOf(cp.getChannelProductNo()) : null;
        return NaverProductItem.builder()
                .channelProductNo(channelProductNo)
                .productName(cp.getName())
                .salePrice(cp.getSalePrice())
                .stockQuantity(cp.getStockQuantity())
                .statusType(cp.getStatusType())
                .representativeImageUrl(imageUrl)
                .leafCategoryId(cp.getCategoryId())
                .rawPayload(toRawPayload(row, rawChannelProductNode))
                .build();
    }

    private String toRawPayload(ProductSearchContentRow row, JsonNode rawChannelProductNode) {
        ObjectNode payload = objectMapper.createObjectNode();
        if (row.getGroupProductNo() != null) {
            payload.put("groupProductNo", row.getGroupProductNo());
        } else {
            payload.putNull("groupProductNo");
        }
        if (row.getOriginProductNo() != null) {
            payload.put("originProductNo", row.getOriginProductNo());
        } else {
            payload.putNull("originProductNo");
        }
        payload.set("channelProduct",
                rawChannelProductNode != null && !rawChannelProductNode.isMissingNode()
                        ? rawChannelProductNode
                        : objectMapper.createObjectNode());
        return payload.toString();
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ProductSearchRequest {
        private int page;
        private int size;

        public ProductSearchRequest(int page, int size) {
            this.page = page;
            this.size = size;
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ProductSearchApiResponse {
        @JsonProperty("contents")
        private List<ProductSearchContentRow> contents;
        @JsonProperty("totalCount")
        @JsonAlias("total_count")
        private Integer totalCount;
    }

    /** API 응답의 contents[] 한 행 (원상품/그룹 단위, channelProducts 배열 포함) */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ProductSearchContentRow {
        @JsonProperty("groupProductNo")
        private Long groupProductNo;
        @JsonProperty("originProductNo")
        private Long originProductNo;
        @JsonProperty("channelProducts")
        private List<ChannelProduct> channelProducts;
    }

    /** 채널 상품 1건 (실제 상품 필드가 여기 있음) */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ChannelProduct {
        @JsonProperty("channelProductNo")
        private Long channelProductNo;
        @JsonProperty("name")
        private String name;
        @JsonProperty("statusType")
        private String statusType;
        @JsonProperty("channelProductDisplayStatusType")
        private String channelProductDisplayStatusType;
        @JsonProperty("salePrice")
        private Long salePrice;
        @JsonProperty("stockQuantity")
        private Integer stockQuantity;
        @JsonProperty("representativeImage")
        private RepresentativeImage representativeImage;
        @JsonProperty("categoryId")
        private String categoryId;
        @JsonProperty("modifiedDate")
        private String modifiedDate;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class RepresentativeImage {
        @JsonProperty("url")
        private String url;
    }
}
