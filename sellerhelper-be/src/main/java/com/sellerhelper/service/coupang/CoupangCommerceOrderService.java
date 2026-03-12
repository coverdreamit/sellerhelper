package com.sellerhelper.service.coupang;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
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

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 쿠팡 RG Order API - 주문 목록 조회.
 *
 * @see <a href="https://developers.coupangcorp.com/hc/en-us/articles/41131195825433-RG-Order-API-List-Query">RG Order API (List Query)</a>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CoupangCommerceOrderService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final StoreRepository storeRepository;
    private final StoreAuthRepository storeAuthRepository;
    private final RestTemplate restTemplate;

    /**
     * 결제일 기준 주문 목록 조회 (nextToken 페이지네이션 모두 수집).
     *
     * @param storeUid   스토어 UID
     * @param dateFrom   조회 시작일 (yyyyMMdd 또는 LocalDate)
     * @param dateTo     조회 종료일
     * @return API 응답 주문 목록 (한 건 = orderId 단위, orderItems 포함)
     */
    @Transactional(readOnly = true)
    public List<RgOrderDto> fetchRgOrders(Long storeUid, LocalDate dateFrom, LocalDate dateTo) {
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));
        validateCoupangStore(store);

        StoreAuth auth = storeAuthRepository.findByStore_Uid(storeUid)
                .orElseThrow(() -> new IllegalArgumentException("API 인증 정보가 없습니다. 스토어 연동을 먼저 진행해 주세요."));
        String vendorId = requireVendorId(store);

        String paidDateFrom = dateFrom.format(DATE_FORMAT);
        String paidDateTo = dateTo.format(DATE_FORMAT);

        List<RgOrderDto> all = new ArrayList<>();
        String nextToken = null;

        try {
            do {
                RgOrderListResponse response = requestRgOrders(auth, vendorId, paidDateFrom, paidDateTo, nextToken);
                if (response == null || response.getData() == null) {
                    break;
                }
                if (response.getData() != null) {
                    all.addAll(response.getData());
                }
                nextToken = response.getNextToken();
                if (nextToken == null || nextToken.isBlank()) {
                    break;
                }
            } while (true);

            log.info("[쿠팡 API] RG 주문 목록 조회 완료 storeUid={}, count={}", storeUid, all.size());
            return all;
        } catch (HttpClientErrorException e) {
            throw toKoreanException(e, "쿠팡 주문 목록 조회");
        } catch (Exception e) {
            log.error("[쿠팡 API] RG 주문 목록 조회 실패 storeUid={}", storeUid, e);
            throw new IllegalStateException("쿠팡 주문 목록 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
    }

    private RgOrderListResponse requestRgOrders(StoreAuth auth, String vendorId, String paidDateFrom, String paidDateTo, String nextToken) {
        String path = CoupangApiConstants.pathRgOrders(vendorId);
        UriComponentsBuilder builder = UriComponentsBuilder.newInstance()
                .queryParam("paidDateFrom", paidDateFrom)
                .queryParam("paidDateTo", paidDateTo);
        if (nextToken != null && !nextToken.isBlank()) {
            builder.queryParam("nextToken", nextToken);
        }
        String query = builder.build().getQuery();
        String authHeader = CoupangHmacSigner.createAuthorizationHeader(
                auth.getApiKey(), auth.getApiSecret(), "GET", path, query != null ? query : "");

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        String url = CoupangApiConstants.BASE_URL + path + "?" + (query != null ? query : "");
        ResponseEntity<RgOrderListResponse> response = restTemplate.exchange(
                url, HttpMethod.GET, new HttpEntity<>(headers), RgOrderListResponse.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            return null;
        }
        return response.getBody();
    }

    private void validateCoupangStore(Store store) {
        if (store.getMall() == null || !"COUPANG".equalsIgnoreCase(store.getMall().getCode())) {
            throw new IllegalArgumentException("쿠팡 스토어만 주문 조회가 가능합니다.");
        }
    }

    private String requireVendorId(Store store) {
        String vendorId = store.getMallSellerId();
        if (vendorId == null || vendorId.isBlank()) {
            throw new IllegalArgumentException("쿠팡 판매자 ID(vendorId)가 등록되지 않았습니다. 스토어 설정에서 판매자 ID를 입력해 주세요.");
        }
        return vendorId;
    }

    private static IllegalStateException toKoreanException(HttpClientErrorException e, String action) {
        int status = e.getStatusCode() != null ? e.getStatusCode().value() : 0;
        if (status == 400) {
            return new IllegalStateException(action + "에 실패했습니다. 요청값이 올바르지 않습니다. 판매자 ID, 조회 기간을 확인해 주세요.");
        }
        if (status == 401) {
            return new IllegalStateException(action + "에 실패했습니다. 인증에 실패했습니다. Access Key와 Secret Key를 확인해 주세요.");
        }
        if (status == 403) {
            return new IllegalStateException(action + "에 실패했습니다. API 권한이 없거나 접근이 제한되었습니다.");
        }
        if (status == 429) {
            return new IllegalStateException(action + "에 실패했습니다. 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.");
        }
        return new IllegalStateException(action + "에 실패했습니다. 쿠팡 API 오류가 발생했습니다. (HTTP " + status + ")");
    }

    // ----- API 응답 DTO -----

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RgOrderListResponse {
        private Integer code;
        private String message;
        private List<RgOrderDto> data;
        private String nextToken;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RgOrderDto {
        private Long orderId;
        private String vendorId;
        /** 결제 완료 시각 (timestamp ms 문자열) */
        private String paidAt;
        @JsonProperty("orderItems")
        private List<RgOrderItemDto> orderItems;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RgOrderItemDto {
        private Long vendorItemId;
        private String productName;
        private Integer salesQuantity;
        @JsonProperty("unitSalesPrice")
        private Long unitSalesPrice;
        private String currency;
    }
}
