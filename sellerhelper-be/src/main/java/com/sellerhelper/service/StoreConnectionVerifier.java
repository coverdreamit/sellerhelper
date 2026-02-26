package com.sellerhelper.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sellerhelper.entity.Store;
import com.sellerhelper.entity.StoreAuth;
import com.sellerhelper.repository.StoreAuthRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

/**
 * 플랫폼별 API 연동 검증.
 * 실제 API 호출이 성공해야만 연동됨으로 표시.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StoreConnectionVerifier {

    private final StoreAuthRepository storeAuthRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String NAVER_TOKEN_URL = "https://api.commerce.naver.com/external/v1/oauth2/token";

    /**
     * 스토어 API 연동 검증 시도. 성공 시 StoreAuth.verifiedAt 설정.
     *
     * @return 성공 여부
     */
    public boolean verify(Store store, StoreAuth auth) {
        log.info("[스토어 연동테스트] 시작 storeUid={}, mall={}",
                store != null ? store.getUid() : null,
                store != null && store.getMall() != null ? store.getMall().getCode() : null);
        if (auth == null || !StringUtils.hasText(auth.getApiKey()) || !StringUtils.hasText(auth.getApiSecret())) {
            log.info("[스토어 연동테스트] 실패 - API Key/Secret 없음");
            return false;
        }
        String mallCode = store.getMall() != null ? store.getMall().getCode() : null;
        if (mallCode == null) {
            log.info("[스토어 연동테스트] 실패 - 플랫폼 정보 없음");
            return false;
        }

        switch (mallCode.toUpperCase()) {
            case "NAVER":
                return verifyNaver(store, auth);
            case "COUPANG":
                return verifyCoupang(auth);
            default:
                log.info("[스토어 연동테스트] 해당 플랫폼({}) 연동 검증 미지원", mallCode);
                return false;
        }
    }

    private boolean verifyNaver(Store store, StoreAuth auth) {
        log.info("[스토어 연동테스트] 네이버 토큰 발급 시도 storeUid={}", store.getUid());
        try {
            long timestamp = System.currentTimeMillis();
            String clientId = auth.getApiKey();
            String clientSecret = auth.getApiSecret();
            log.debug("[스토어 연동테스트] client_id={}, timestamp={}", clientId, timestamp);
            String signature = generateNaverSignature(clientId, clientSecret, timestamp);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("client_id", clientId);
            params.add("client_secret_sign", signature);
            params.add("grant_type", "client_credentials");
            params.add("type", "SELF");
            params.add("timestamp", String.valueOf(timestamp));

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            ResponseEntity<NaverTokenResponse> response = restTemplate.exchange(
                    NAVER_TOKEN_URL,
                    HttpMethod.POST,
                    request,
                    NaverTokenResponse.class
            );
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null
                    && StringUtils.hasText(response.getBody().getAccessToken())) {
                NaverTokenResponse body = response.getBody();
                long expiresIn = body.getExpiresIn() != null ? body.getExpiresIn() : 3600;
                auth.setAccessToken(body.getAccessToken());
                auth.setTokenExpiresAt(Instant.now().plusSeconds(expiresIn));
                storeAuthRepository.save(auth);
                log.info("[스토어 연동테스트] 네이버 성공 storeUid={}, expiresIn={}초", store.getUid(), expiresIn);
                return true;
            }
            log.info("[스토어 연동테스트] 네이버 실패 - 응답 status={}, body={}",
                    response.getStatusCode(), response.getBody());
            return false;
        } catch (Exception e) {
            log.info("[스토어 연동테스트] 네이버 예외 storeUid={}: {} - {}", store.getUid(), e.getClass().getSimpleName(), e.getMessage());
            if (log.isDebugEnabled()) {
                log.debug("[스토어 연동테스트] 상세 스택", e);
            }
            return false;
        }
    }

    /**
     * 전자서명: BCrypt.hashpw(client_id + "_" + timestamp, client_secret) -> Base64
     */
    private String generateNaverSignature(String clientId, String clientSecret, long timestamp) {
        String password = clientId + "_" + timestamp;
        String hashed = org.springframework.security.crypto.bcrypt.BCrypt.hashpw(password, clientSecret);
        return Base64.getEncoder().encodeToString(hashed.getBytes(StandardCharsets.UTF_8));
    }

    private boolean verifyCoupang(StoreAuth auth) {
        log.info("[스토어 연동테스트] 쿠팡 연동 검증 미구현");
        return false;
    }

    @Data
    private static class NaverTokenResponse {
        @JsonProperty("access_token")
        private String accessToken;
        @JsonProperty("expires_in")
        private Long expiresIn;
    }
}
