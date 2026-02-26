package com.sellerhelper.service.naver;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.sellerhelper.dto.naver.*;
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
import org.springframework.web.util.UriComponentsBuilder;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;

/**
 * 네이버 스마트스토어(커머스) API - 주문·배송 조회
 * @see https://apicenter.commerce.naver.com/docs/commerce-api/2.68.0/%EC%A3%BC%EB%AC%B8-%EC%A1%B0%ED%9A%8C
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NaverCommerceOrderService {

    private static final String BASE_URL = "https://api.commerce.naver.com/external";
    private static final String LAST_CHANGED_URL = BASE_URL + "/v1/pay-order/seller/product-orders/last-changed-statuses";
    private static final String PRODUCT_ORDERS_QUERY_URL = BASE_URL + "/v1/pay-order/seller/product-orders/query";
    /** API 요청/응답 날짜 형식 (KST) */
    private static final DateTimeFormatter API_DATETIME = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");

    private final StoreRepository storeRepository;
    private final StoreAuthRepository storeAuthRepository;
    private final NaverCommerceTokenService tokenService;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 변경 상품 주문 내역 조회 (변경 일시 기준, 최대 24시간 구간)
     * @param storeUid 스토어 UID
     * @param lastChangedFrom 조회 시작 일시 (KST, inclusive)
     * @param lastChangedTo 조회 종료 일시 (KST, inclusive, null이면 24시간)
     * @param limitCount 최대 건수 (기본 300)
     * @param moreSequence 페이징용 (이전 응답의 more.moreSequence)
     */
    @Transactional(readOnly = true)
    public NaverLastChangedResult getLastChangedProductOrders(
            Long storeUid,
            ZonedDateTime lastChangedFrom,
            ZonedDateTime lastChangedTo,
            Integer limitCount,
            Integer moreSequence) {
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        if (!"NAVER".equalsIgnoreCase(store.getMall() != null ? store.getMall().getCode() : null)) {
            throw new IllegalArgumentException("네이버 스토어만 주문 조회가 가능합니다.");
        }
        StoreAuth auth = storeAuthRepository.findByStore_Uid(storeUid)
                .orElseThrow(() -> new IllegalArgumentException("API 인증 정보가 없습니다. 스토어 연동을 먼저 진행해 주세요."));

        String token = tokenService.getOrRefreshToken(store, auth);

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(LAST_CHANGED_URL)
                .queryParam("lastChangedFrom", lastChangedFrom.format(API_DATETIME));
        if (lastChangedTo != null) {
            builder.queryParam("lastChangedTo", lastChangedTo.format(API_DATETIME));
        }
        if (limitCount != null && limitCount > 0) {
            builder.queryParam("limitCount", Math.min(300, limitCount));
        }
        if (moreSequence != null) {
            builder.queryParam("moreSequence", moreSequence);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            headers.set("Accept", "application/json;charset=UTF-8");
            HttpEntity<Void> request = new HttpEntity<>(headers);
            ResponseEntity<LastChangedApiResponse> response = restTemplate.exchange(
                    builder.toUriString(),
                    HttpMethod.GET,
                    request,
                    LastChangedApiResponse.class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return NaverLastChangedResult.builder()
                        .data(Collections.emptyList())
                        .more(null)
                        .build();
            }

            LastChangedApiResponse body = response.getBody();
            List<NaverLastChangedItem> data = body.getData() != null ? body.getData() : Collections.emptyList();
            return NaverLastChangedResult.builder()
                    .data(data)
                    .more(body.getMore())
                    .build();
        } catch (Exception e) {
            log.warn("네이버 변경 주문 조회 실패 storeUid={}: {}", storeUid, e.getMessage());
            throw new IllegalStateException("변경 주문 조회에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 상품 주문 상세 내역 조회 (상품 주문 번호 최대 300개)
     */
    @Transactional(readOnly = true)
    public List<NaverProductOrderDetail> getProductOrderDetails(Long storeUid, List<String> productOrderIds) {
        if (productOrderIds == null || productOrderIds.isEmpty()) {
            return Collections.emptyList();
        }
        if (productOrderIds.size() > 300) {
            throw new IllegalArgumentException("상품 주문 번호는 최대 300개까지 조회 가능합니다.");
        }

        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        if (!"NAVER".equalsIgnoreCase(store.getMall() != null ? store.getMall().getCode() : null)) {
            throw new IllegalArgumentException("네이버 스토어만 주문 조회가 가능합니다.");
        }
        StoreAuth auth = storeAuthRepository.findByStore_Uid(storeUid)
                .orElseThrow(() -> new IllegalArgumentException("API 인증 정보가 없습니다. 스토어 연동을 먼저 진행해 주세요."));

        String token = tokenService.getOrRefreshToken(store, auth);

        NaverProductOrderQueryRequest requestBody = NaverProductOrderQueryRequest.builder()
                .productOrderIds(productOrderIds)
                .build();

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            headers.set("Accept", "application/json;charset=UTF-8");
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<NaverProductOrderQueryRequest> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<ProductOrdersQueryApiResponse> response = restTemplate.exchange(
                    PRODUCT_ORDERS_QUERY_URL,
                    HttpMethod.POST,
                    request,
                    ProductOrdersQueryApiResponse.class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return Collections.emptyList();
            }

            List<NaverProductOrderDetail> data = response.getBody().getData();
            return data != null ? data : Collections.emptyList();
        } catch (Exception e) {
            log.warn("네이버 상품 주문 상세 조회 실패 storeUid={}: {}", storeUid, e.getMessage());
            throw new IllegalStateException("상품 주문 상세 조회에 실패했습니다: " + e.getMessage());
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class LastChangedApiResponse {
        @JsonProperty("data")
        private List<NaverLastChangedItem> data;
        @JsonProperty("more")
        private NaverLastChangedMore more;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ProductOrdersQueryApiResponse {
        @JsonProperty("data")
        private List<NaverProductOrderDetail> data;
    }
}
