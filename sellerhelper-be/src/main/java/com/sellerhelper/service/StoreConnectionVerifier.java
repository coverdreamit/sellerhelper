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
    private final RestTemplate restTemplate;

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
            String clientId = StringUtils.hasText(auth.getApiKey()) ? auth.getApiKey().trim() : "";
            String clientSecret = StringUtils.hasText(auth.getApiSecret()) ? auth.getApiSecret().trim() : "";
            if (!StringUtils.hasText(clientId) || !StringUtils.hasText(clientSecret)) {
                log.info("[스토어 연동테스트] API Key 또는 Secret 비어 있음");
                return false;
            }
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
            ResponseEntity<NaverTokenResponse> response;
            try {
                response = restTemplate.exchange(
                        NAVER_TOKEN_URL,
                        HttpMethod.POST,
                        request,
                        NaverTokenResponse.class
                );
            } catch (org.springframework.web.client.HttpClientErrorException e) {
                log.warn("[스토어 연동테스트] 네이버 토큰 API 오류: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
                return false;
            }
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
        } catch (IllegalArgumentException e) {
            if (e.getMessage() != null && (e.getMessage().contains("Invalid salt") || e.getMessage().contains("Client Secret은 네이버"))) {
                log.warn("[스토어 연동테스트] 네이버 Client Secret 형식 오류");
                throw e;
            }
            log.info("[스토어 연동테스트] 네이버 예외 storeUid={}: {} - {}", store.getUid(), e.getClass().getSimpleName(), e.getMessage());
            if (log.isDebugEnabled()) {
                log.debug("[스토어 연동테스트] 상세 스택", e);
            }
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
     * 전자서명: BCrypt.hashpw(client_id + "_" + timestamp, client_secret) → Base64 (URL-safe)
     * client_secret은 네이버 커머스API센터에서 발급한 값으로, 반드시 $2a$10$... 형태의 BCrypt salt 형식이어야 함.
     * @see https://apicenter.commerce.naver.com/docs/auth
     */
    private String generateNaverSignature(String clientId, String clientSecret, long timestamp) {
        if (clientSecret == null || !clientSecret.startsWith("$2a$") && !clientSecret.startsWith("$2b$")) {
            throw new IllegalArgumentException(
                "Client Secret은 네이버 커머스API센터 [애플리케이션 상세]에서 발급한 '애플리케이션 시크릿' 값을 그대로 입력해야 합니다. " +
                "형식: $2a$10$ 로 시작하는 문자열입니다. 다른 키(Secret Key 등)를 넣지 마세요.");
        }
        String password = clientId + "_" + timestamp;
        String hashed = org.springframework.security.crypto.bcrypt.BCrypt.hashpw(password, clientSecret);
        return Base64.getUrlEncoder().encodeToString(hashed.getBytes(StandardCharsets.UTF_8));
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
