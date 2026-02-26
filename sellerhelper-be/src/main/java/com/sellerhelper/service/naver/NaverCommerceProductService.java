package com.sellerhelper.service.naver;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
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
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 네이버 스마트스토어(커머스) API - 상품목록 조회
 * @see https://api.commerce.naver.com/external/v1/products/search
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NaverCommerceProductService {

    private static final String PRODUCT_SEARCH_URL = "https://api.commerce.naver.com/external/v1/products/search";

    private final StoreRepository storeRepository;
    private final StoreAuthRepository storeAuthRepository;
    private final NaverCommerceTokenService tokenService;
    private final RestTemplate restTemplate = new RestTemplate();

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
            List<NaverProductItem> items = body.getContents() != null
                    ? body.getContents().stream()
                    .map(this::toProductItem)
                    .collect(Collectors.toList())
                    : Collections.emptyList();

            return NaverProductSearchResult.builder()
                    .contents(items)
                    .page(safePage)
                    .size(safeSize)
                    .totalCount(body.getTotalCount() != null ? body.getTotalCount() : items.size())
                    .build();
        } catch (Exception e) {
            log.warn("네이버 상품목록 조회 실패 storeUid={}: {}", storeUid, e.getMessage());
            throw new IllegalStateException("상품목록 조회에 실패했습니다: " + e.getMessage());
        }
    }

    private NaverProductItem toProductItem(ProductSearchContent c) {
        if (c == null) return NaverProductItem.empty();
        return NaverProductItem.builder()
                .channelProductNo(c.getChannelProductNo())
                .productName(c.getProductName())
                .salePrice(c.getSalePrice())
                .stockQuantity(c.getStockQuantity())
                .statusType(c.getStatusType())
                .representativeImageUrl(c.getRepresentativeImageUrl())
                .leafCategoryId(c.getLeafCategoryId())
                .build();
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
        private List<ProductSearchContent> contents;
        @JsonProperty("totalCount")
        private Integer totalCount;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ProductSearchContent {
        @JsonProperty("channelProductNo")
        private String channelProductNo;
        @JsonProperty("productName")
        private String productName;
        @JsonProperty("salePrice")
        private Long salePrice;
        @JsonProperty("stockQuantity")
        private Integer stockQuantity;
        @JsonProperty("statusType")
        private String statusType;
        @JsonProperty("representativeImageUrl")
        private String representativeImageUrl;
        @JsonProperty("leafCategoryId")
        private String leafCategoryId;
    }
}
