package com.sellerhelper.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sellerhelper.entity.Store;
import com.sellerhelper.entity.StoreAuth;
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
import java.util.Base64;

/**
 * 플랫폼별 API 연동 검증.
 * 실제 API 호출이 성공해야만 연동됨으로 표시.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StoreConnectionVerifier {

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String NAVER_TOKEN_URL = "https://api.commerce.naver.com/external/v1/oauth2/token";

    /**
     * 스토어 API 연동 검증 시도. 성공 시 StoreAuth.verifiedAt 설정.
     *
     * @return 성공 여부
     */
    public boolean verify(Store store, StoreAuth auth) {
        if (auth == null || !StringUtils.hasText(auth.getApiKey()) || !StringUtils.hasText(auth.getApiSecret())) {
            return false;
        }
        String mallCode = store.getMall() != null ? store.getMall().getCode() : null;
        if (mallCode == null) return false;

        switch (mallCode.toUpperCase()) {
            case "NAVER":
                return verifyNaver(auth);
            case "COUPANG":
                return verifyCoupang(auth);
            default:
                log.debug("해당 플랫폼({})의 연동 검증은 아직 지원되지 않습니다.", mallCode);
                return false;
        }
    }

    private boolean verifyNaver(StoreAuth auth) {
        try {
            long timestamp = System.currentTimeMillis();
            String clientId = auth.getApiKey();
            String clientSecret = auth.getApiSecret();
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
                return true;
            }
            return false;
        } catch (Exception e) {
            log.debug("네이버 연동 검증 실패: {}", e.getMessage());
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
        // TODO: 쿠팡 API 연동 검증 구현
        log.debug("쿠팡 연동 검증은 아직 미구현");
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
