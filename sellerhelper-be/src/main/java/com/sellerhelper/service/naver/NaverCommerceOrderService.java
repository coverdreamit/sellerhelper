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
import java.util.Map;
import java.util.function.Supplier;

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
    private static final String PRODUCT_ORDERS_CONFIRM_URL = BASE_URL + "/v1/pay-order/seller/product-orders/confirm";
    private static final String PRODUCT_ORDERS_DISPATCH_URL = BASE_URL + "/v1/pay-order/seller/product-orders/dispatch";
    private static final int MAX_RATE_LIMIT_RETRIES = 5;
    private static final long BASE_RETRY_DELAY_MS = 400L;

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

            ResponseEntity<LastChangedApiResponse> response = executeWithRateLimitRetry(
                    () -> restTemplate.exchange(
                            uri,
                            HttpMethod.GET,
                            request,
                            LastChangedApiResponse.class
                    ),
                    "변경 주문 조회",
                    storeUid
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return NaverLastChangedResult.builder()
                        .data(Collections.emptyList())
                        .more(null)
                        .build();
            }

            LastChangedApiResponse body = response.getBody();

            List<NaverLastChangedItem> data = Collections.emptyList();
            NaverLastChangedMore more = null;
            if (body.getData() != null) {
                if (body.getData().getLastChangeStatuses() != null) {
                    data = body.getData().getLastChangeStatuses();
                } else if (body.getData().getLastChangedStatuses() != null) {
                    data = body.getData().getLastChangedStatuses();
                }
                more = body.getData().getMore();
            } else if (body.getLastChangedStatuses() != null) {
                // 하위호환: data 래퍼 없이 내려오는 응답도 허용
                data = body.getLastChangedStatuses();
                more = body.getMore();
            }

            return NaverLastChangedResult.builder()
                    .data(data)
                    .more(more)
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

            ResponseEntity<ProductOrdersQueryApiResponse> response = executeWithRateLimitRetry(
                    () -> restTemplate.exchange(
                            PRODUCT_ORDERS_QUERY_URL,
                            HttpMethod.POST,
                            request,
                            ProductOrdersQueryApiResponse.class
                    ),
                    "상품 주문 상세 조회",
                    storeUid
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

    /** 발주 확인 처리 (상품주문번호 최대 30개 권장) */
    @Transactional(readOnly = true)
    public Object confirmProductOrders(Long storeUid, List<String> productOrderIds) {
        if (productOrderIds == null || productOrderIds.isEmpty()) {
            throw new IllegalArgumentException("발주 확인할 상품 주문 번호가 없습니다.");
        }
        Map<String, Object> body = Map.of("productOrderIds", productOrderIds);
        return postOrderAction(storeUid, PRODUCT_ORDERS_CONFIRM_URL, body, "발주 확인");
    }

    /** 발송 처리 (상품주문번호별 택배사/송장) */
    @Transactional(readOnly = true)
    public Object dispatchProductOrders(Long storeUid, List<DispatchItem> dispatchItems) {
        if (dispatchItems == null || dispatchItems.isEmpty()) {
            throw new IllegalArgumentException("발송 처리할 상품 주문 정보가 없습니다.");
        }
        Map<String, Object> body = Map.of("dispatchProductOrders", dispatchItems);
        return postOrderAction(storeUid, PRODUCT_ORDERS_DISPATCH_URL, body, "발송 처리");
    }

    private Object postOrderAction(Long storeUid, String url, Object requestBody, String actionName) {
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));

        if (!"NAVER".equalsIgnoreCase(store.getMall() != null ? store.getMall().getCode() : null)) {
            throw new IllegalArgumentException("네이버 스토어만 " + actionName + "가 가능합니다.");
        }

        StoreAuth auth = storeAuthRepository.findByStore_Uid(storeUid)
                .orElseThrow(() -> new IllegalArgumentException("API 인증 정보가 없습니다. 스토어 연동을 먼저 진행해 주세요."));
        String token = tokenService.getOrRefreshToken(store, auth);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            headers.set("Accept", "application/json;charset=UTF-8");
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Object> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Object> response = executeWithRateLimitRetry(
                    () -> restTemplate.exchange(
                            url,
                            HttpMethod.POST,
                            request,
                            Object.class
                    ),
                    actionName,
                    storeUid
            );
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new IllegalStateException("네이버 " + actionName + " API 응답이 비정상입니다. status=" + response.getStatusCode());
            }
            return response.getBody();
        } catch (HttpClientErrorException e) {
            String body = e.getResponseBodyAsString();
            log.warn("네이버 {} API 오류 storeUid={}, status={}, body={}", actionName, storeUid, e.getStatusCode(), body);
            String detail = (body != null && !body.isBlank()) ? " " + body : (" " + e.getMessage());
            throw new IllegalStateException("네이버 " + actionName + "에 실패했습니다:" + detail);
        } catch (Exception e) {
            log.warn("네이버 {} 실패 storeUid={}: {}", actionName, storeUid, e.getMessage());
            throw new IllegalStateException("네이버 " + actionName + "에 실패했습니다: " + e.getMessage());
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class LastChangedApiResponse {

        @JsonProperty("data")
        private LastChangedData data;

        @JsonProperty("lastChangedStatuses")
        private List<NaverLastChangedItem> lastChangedStatuses;

        @JsonProperty("more")
        private NaverLastChangedMore more;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class LastChangedData {
        @JsonProperty("lastChangeStatuses")
        private List<NaverLastChangedItem> lastChangeStatuses;

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

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DispatchItem {
        @JsonProperty("productOrderId")
        private String productOrderId;

        @JsonProperty("deliveryMethod")
        private String deliveryMethod;

        @JsonProperty("deliveryCompany")
        private String deliveryCompany;

        @JsonProperty("trackingNumber")
        private String trackingNumber;
    }

    private <T> T executeWithRateLimitRetry(
            Supplier<T> action,
            String actionName,
            Long storeUid
    ) {
        for (int attempt = 1; attempt <= MAX_RATE_LIMIT_RETRIES; attempt++) {
            try {
                return action.get();
            } catch (HttpClientErrorException e) {
                if (e.getStatusCode() != HttpStatus.TOO_MANY_REQUESTS || attempt == MAX_RATE_LIMIT_RETRIES) {
                    throw e;
                }
                long delayMs = resolveRetryDelayMs(e.getResponseHeaders(), attempt);
                log.warn("네이버 {} rate-limit 재시도 storeUid={}, attempt={}/{}, delayMs={}",
                        actionName, storeUid, attempt, MAX_RATE_LIMIT_RETRIES, delayMs);
                sleepSafely(delayMs);
            }
        }
        throw new IllegalStateException("네이버 API 재시도 한도를 초과했습니다.");
    }

    private static long resolveRetryDelayMs(HttpHeaders headers, int attempt) {
        if (headers != null) {
            String retryAfter = headers.getFirst("Retry-After");
            if (retryAfter != null) {
                try {
                    long sec = Long.parseLong(retryAfter.trim());
                    if (sec > 0) {
                        return sec * 1000L;
                    }
                } catch (NumberFormatException ignored) {
                    // fallback to exponential backoff
                }
            }
        }
        long delay = BASE_RETRY_DELAY_MS * (1L << (attempt - 1));
        return Math.min(delay, 5000L);
    }

    private static void sleepSafely(long millis) {
        try {
            Thread.sleep(Math.max(0L, millis));
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }
}