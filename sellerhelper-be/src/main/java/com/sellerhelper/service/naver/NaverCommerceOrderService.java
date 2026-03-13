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
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;

/**
 * 네이버 스마트스토어(커머스) API - 주문·배송 조회
 *
 * <p>조회 기간(lastChangedFrom/lastChangedTo): ISO 8601 문자열 사용. Java에서는 {@code ZonedDateTime.toInstant().toString()} (JS toISOString()에 해당). 예: "2026-03-05T09:05:10.602Z"</p>
 *
 * @see <a href="https://apicenter.commerce.naver.com/docs/commerce-api/current">커머스API 문서</a>
 * @see <a href="https://apicenter.commerce.naver.com/docs/commerce-api/current/get-ns-information-paged-list-nfa">SKU 목록 조회 API</a>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NaverCommerceOrderService {

    private static final String BASE_URL = "https://api.commerce.naver.com/external";
    private static final String LAST_CHANGED_URL = BASE_URL + "/v1/pay-order/seller/product-orders/last-changed-statuses";
    private static final String PRODUCT_ORDERS_QUERY_URL = BASE_URL + "/v1/pay-order/seller/product-orders/query";

    private final StoreRepository storeRepository;
    private final StoreAuthRepository storeAuthRepository;
    private final NaverCommerceTokenService tokenService;
    private final RestTemplate restTemplate;

    /**
     * 변경 주문 조회
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

        // 조회 기간: ISO 8601 (밀리초 단위로 truncate)
        // 예: "2026-03-05T09:05:10.602Z"
        String from = lastChangedFrom.toInstant().truncatedTo(ChronoUnit.MILLIS).toString();
        String to = lastChangedTo != null ? lastChangedTo.toInstant().truncatedTo(ChronoUnit.MILLIS).toString() : null;

        UriComponentsBuilder builder = UriComponentsBuilder
                .fromHttpUrl(LAST_CHANGED_URL)
                .queryParam("lastChangedFrom", from);
        if (to != null) {
            builder.queryParam("lastChangedTo", to);
        }
        if (limitCount != null && limitCount > 0) {
            builder.queryParam("limitCount", Math.min(300, limitCount));
        }
        if (moreSequence != null) {
            builder.queryParam("moreSequence", moreSequence);
        }

        URI uri = builder.build().encode().toUri();
        log.info("네이버 주문 조회 URI = {}", uri);

        try {

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            headers.set("Accept", "application/json;charset=UTF-8");

            HttpEntity<Void> request = new HttpEntity<>(headers);

            ResponseEntity<LastChangedApiResponse> response =
                    restTemplate.exchange(
                            uri,
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

            List<NaverLastChangedItem> data =
                    body.getLastChangedStatuses() != null ? body.getLastChangedStatuses() : Collections.emptyList();

            return NaverLastChangedResult.builder()
                    .data(data)
                    .more(body.getMore())
                    .build();

        } catch (HttpClientErrorException e) {
            String body = e.getResponseBodyAsString();
            log.warn("네이버 변경 주문 조회 API 오류 storeUid={}, status={}, body={}", storeUid, e.getStatusCode(), body);
            String detail = (body != null && !body.isBlank()) ? " " + body : (" " + e.getMessage());
            throw new IllegalStateException("네이버 변경 주문 조회에 실패했습니다:" + detail);
        } catch (Exception e) {
            log.warn("네이버 변경 주문 조회 실패 storeUid={}: {}", storeUid, e.getMessage());
            throw new IllegalStateException("네이버 변경 주문 조회에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 상품 주문 상세 조회
     */
    @Transactional(readOnly = true)
    public List<NaverProductOrderDetail> getProductOrderDetails(
            Long storeUid,
            List<String> productOrderIds) {

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

        NaverProductOrderQueryRequest requestBody =
                NaverProductOrderQueryRequest.builder()
                        .productOrderIds(productOrderIds)
                        .build();

        try {

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            headers.set("Accept", "application/json;charset=UTF-8");
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<NaverProductOrderQueryRequest> request =
                    new HttpEntity<>(requestBody, headers);

            ResponseEntity<ProductOrdersQueryApiResponse> response =
                    restTemplate.exchange(
                            PRODUCT_ORDERS_QUERY_URL,
                            HttpMethod.POST,
                            request,
                            ProductOrdersQueryApiResponse.class
                    );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return Collections.emptyList();
            }

            List<NaverProductOrderDetail> data = response.getBody().getProductOrders();

            return data != null ? data : Collections.emptyList();

        } catch (Exception e) {

            log.warn("네이버 상품 주문 상세 조회 실패 storeUid={}: {}", storeUid, e.getMessage());

            throw new IllegalStateException(
                    "상품 주문 상세 조회에 실패했습니다: " + e.getMessage());
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class LastChangedApiResponse {

        @JsonProperty("lastChangedStatuses")
        private List<NaverLastChangedItem> lastChangedStatuses;

        @JsonProperty("more")
        private NaverLastChangedMore more;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ProductOrdersQueryApiResponse {

        /** 네이버 API는 상세 조회 응답 본문을 data 필드로 반환 */
        @JsonProperty("data")
        private List<NaverProductOrderDetail> productOrders;
    }
}