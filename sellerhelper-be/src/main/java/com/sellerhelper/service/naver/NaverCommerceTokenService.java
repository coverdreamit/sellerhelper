package com.sellerhelper.service.naver;

import com.sellerhelper.entity.Store;
import com.sellerhelper.entity.StoreAuth;
import com.sellerhelper.repository.StoreAuthRepository;
import com.fasterxml.jackson.annotation.JsonProperty;
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
 * 네이버 스마트스토어(커머스) API 토큰 발급·유지
 * @see https://apicenter.commerce.naver.com/docs/commerce-api/current
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NaverCommerceTokenService {

    private static final String TOKEN_URL = "https://api.commerce.naver.com/external/v1/oauth2/token";
    /** 토큰 만료 5분 전에 갱신 */
    private static final int EXPIRE_BUFFER_MINUTES = 5;

    private final StoreAuthRepository storeAuthRepository;
    private final RestTemplate restTemplate;

    /**
     * 유효한 액세스 토큰 반환. 만료 임박 시 재발급 후 StoreAuth에 저장.
     */
    public String getOrRefreshToken(Store store, StoreAuth auth) {
        if (auth == null || !StringUtils.hasText(auth.getApiKey()) || !StringUtils.hasText(auth.getApiSecret())) {
            throw new IllegalArgumentException("API Key와 API Secret이 필요합니다.");
        }
        if (!"NAVER".equalsIgnoreCase(store.getMall() != null ? store.getMall().getCode() : null)) {
            throw new IllegalArgumentException("네이버 스토어가 아닙니다.");
        }

        if (isTokenValid(auth)) {
            return auth.getAccessToken();
        }

        return issueAndSaveToken(auth);
    }

    private boolean isTokenValid(StoreAuth auth) {
        if (!StringUtils.hasText(auth.getAccessToken())) return false;
        Instant expiresAt = auth.getTokenExpiresAt();
        if (expiresAt == null) return false;
        return Instant.now().plusSeconds(EXPIRE_BUFFER_MINUTES * 60L).isBefore(expiresAt);
    }

    private String issueAndSaveToken(StoreAuth auth) {
        long timestamp = System.currentTimeMillis();
        String clientId = StringUtils.hasText(auth.getApiKey()) ? auth.getApiKey().trim() : "";
        String clientSecret = StringUtils.hasText(auth.getApiSecret()) ? auth.getApiSecret().trim() : "";
        if (!StringUtils.hasText(clientId) || !StringUtils.hasText(clientSecret)) {
            throw new IllegalArgumentException("API Key와 API Secret이 필요합니다.");
        }
        String signature = generateSignature(clientId, clientSecret, timestamp);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "client_credentials");
        params.add("client_id", clientId);
        params.add("client_secret_sign", signature);
        params.add("type", "SELF");
        params.add("timestamp", String.valueOf(timestamp));

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        ResponseEntity<TokenResponse> response;
        try {
            response = restTemplate.exchange(
                    TOKEN_URL,
                    HttpMethod.POST,
                    request,
                    TokenResponse.class
            );
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.warn("네이버 토큰 발급 API 오류: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new IllegalStateException("네이버 토큰 발급 실패: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
        } catch (org.springframework.web.client.RestClientException e) {
            log.warn("네이버 토큰 발급 요청 실패: {}", e.getMessage());
            throw new IllegalStateException("네이버 토큰 발급 실패: " + e.getMessage());
        }

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null
                || !StringUtils.hasText(response.getBody().getAccessToken())) {
            String body = response.getBody() != null ? response.getBody().toString() : "null";
            log.warn("네이버 토큰 발급 응답 이상: status={}, body={}", response.getStatusCode(), body);
            throw new IllegalStateException("네이버 토큰 발급에 실패했습니다. status=" + response.getStatusCode());
        }

        TokenResponse body = response.getBody();
        auth.setAccessToken(body.getAccessToken());
        auth.setTokenExpiresAt(Instant.now().plusSeconds(body.getExpiresIn() != null ? body.getExpiresIn() : 3600));
        storeAuthRepository.save(auth);

        log.debug("네이버 토큰 갱신 완료, store_uid={}", auth.getStore() != null ? auth.getStore().getUid() : null);
        return auth.getAccessToken();
    }

    /**
     * 전자서명: bcrypt(client_id + "_" + timestamp, client_secret) → Base64 (URL-safe)
     * client_secret은 네이버 커머스API센터에서 발급한 값으로, $2a$10$... 형태의 BCrypt salt 형식이어야 함.
     * @see https://apicenter.commerce.naver.com/docs/auth
     */
    private String generateSignature(String clientId, String clientSecret, long timestamp) {
        if (clientSecret == null || (!clientSecret.startsWith("$2a$") && !clientSecret.startsWith("$2b$"))) {
            throw new IllegalArgumentException(
                "Client Secret은 네이버 커머스API센터 [애플리케이션 상세]의 '애플리케이션 시크릿'($2a$10$... 형태)을 그대로 입력해야 합니다.");
        }
        String password = clientId + "_" + timestamp;
        String hashed = org.springframework.security.crypto.bcrypt.BCrypt.hashpw(password, clientSecret);
        return Base64.getUrlEncoder().encodeToString(hashed.getBytes(StandardCharsets.UTF_8));
    }

    @Data
    private static class TokenResponse {
        @JsonProperty("access_token")
        private String accessToken;
        @JsonProperty("expires_in")
        private Long expiresIn;
    }
}
