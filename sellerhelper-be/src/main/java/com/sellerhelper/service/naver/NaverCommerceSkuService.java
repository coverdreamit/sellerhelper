package com.sellerhelper.service.naver;

import com.sellerhelper.dto.naver.NaverSkuItem;
import com.sellerhelper.dto.naver.NaverSkuPagedResponse;
import com.sellerhelper.dto.naver.NaverSkuQueryPagedRequest;
import com.sellerhelper.entity.Store;
import com.sellerhelper.entity.StoreAuth;
import com.sellerhelper.exception.ResourceNotFoundException;
import com.sellerhelper.repository.StoreAuthRepository;
import com.sellerhelper.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

/**
 * 네이버 스마트스토어(커머스) API - 물류 SKU 조회
 *
 * @see <a href="https://apicenter.commerce.naver.com/docs/commerce-api/current/get-ns-information-paged-list-nfa">SKU 목록 조회 API</a>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NaverCommerceSkuService {

    private static final String BASE_URL = "https://api.commerce.naver.com/external";
    private static final String SKU_QUERY_PAGED_LIST_URL =
            BASE_URL + "/v1/logistics/products/sellers/me/skus/query-paged-list";

    private final StoreRepository storeRepository;
    private final StoreAuthRepository storeAuthRepository;
    private final NaverCommerceTokenService tokenService;
    private final RestTemplate restTemplate;

    /**
     * SKU 목록 페이지 조회
     *
     * @param storeUid 스토어 UID
     * @param request  페이지 요청 (page, size)
     * @return SKU 목록 및 페이징 정보
     */
    @Transactional(readOnly = true)
    public NaverSkuPagedResponse getSkuPagedList(Long storeUid, NaverSkuQueryPagedRequest request) {
        Store store = storeRepository.findById(storeUid)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeUid));

        if (!"NAVER".equalsIgnoreCase(store.getMall() != null ? store.getMall().getCode() : null)) {
            throw new IllegalArgumentException("네이버 스토어만 SKU 조회가 가능합니다.");
        }

        StoreAuth auth = storeAuthRepository.findByStore_Uid(storeUid)
                .orElseThrow(() -> new IllegalArgumentException("API 인증 정보가 없습니다. 스토어 연동을 먼저 진행해 주세요."));

        String token = tokenService.getOrRefreshToken(store, auth);

        NaverSkuQueryPagedRequest body = request != null ? request : NaverSkuQueryPagedRequest.builder()
                .page(0)
                .size(20)
                .build();

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            headers.set("Accept", "application/json;charset=UTF-8");
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<NaverSkuQueryPagedRequest> entity = new HttpEntity<>(body, headers);

            log.info("네이버 SKU 목록 조회 URI = {}", SKU_QUERY_PAGED_LIST_URL);

            ResponseEntity<NaverSkuPagedResponse> response = restTemplate.exchange(
                    SKU_QUERY_PAGED_LIST_URL,
                    HttpMethod.POST,
                    entity,
                    NaverSkuPagedResponse.class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                NaverSkuPagedResponse empty = new NaverSkuPagedResponse();
                empty.setData(Collections.emptyList());
                return empty;
            }

            return response.getBody();
        } catch (Exception e) {
            log.warn("네이버 SKU 목록 조회 실패 storeUid={}: {}", storeUid, e.getMessage());
            throw new IllegalStateException("SKU 목록 조회에 실패했습니다: " + e.getMessage());
        }
    }
}
