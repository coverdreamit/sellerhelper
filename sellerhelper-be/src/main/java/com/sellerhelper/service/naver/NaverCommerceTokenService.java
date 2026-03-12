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
 *
 * <p>토큰 발급 403 발생 시 점검 사항:</p>
 * <ul>
 *   <li>애플리케이션 시크릿: 커머스API센터 [애플리케이션 상세]의 '애플리케이션 시크릿'을 그대로 입력. 반드시 $2a$10$... 형태(BCrypt salt). 공백/줄바꿈 없이.</li>
 *   <li>client_id와 시크릿: 동일 애플리케이션에서 발급한 쌍인지 확인.</li>
 *   <li>서버 시각: timestamp는 약 5분 유효. 서버(또는 실행 환경) 시각이 크게 어긋나면 403.</li>
 *   <li>IP 허용 목록: 커머스API센터에서 요청 출발 IP를 허용했는지 확인.</li>
 *   <li>type=SELF: 셀러 전용 앱은 type=SELLER 사용 불가, SELF만 사용.</li>
 * </ul>
 *
 * @see <a href="https://apicenter.commerce.naver.com/docs/auth">인증 문서</a>
 * @see <a href="https://apicenter.commerce.naver.com/docs/commerce-api/current">커머스API</a>
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
            String body = e.getResponseBodyAsString();
            log.warn("네이버 토큰 발급 API 오류: status={}, body={}", e.getStatusCode(), body);
            String hint = to403Hint(e.getStatusCode().value(), body);
            throw new IllegalStateException("네이버 토큰 발급 실패: " + e.getStatusCode() + (body != null && !body.isBlank() ? " - " + body : "") + (hint != null ? " " + hint : ""));
        } catch (org.springframework.web.client.RestClientException e) {
            log.warn("네이버 토큰 발급 요청 실패: {}", e.getMessage());
            String friendly = toUserFriendlyMessage(e);
            String hint = e.getMessage() != null && e.getMessage().contains("403") ? get403HintKorean() : null;
            throw new IllegalStateException("네이버 토큰 발급 실패: " + friendly + (hint != null ? " " + hint : ""));
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

    /** 403 응답 시 가능 원인 안내 (한글) */
    private static String to403Hint(int status, String body) {
        if (status != 403) return null;
        return get403HintKorean();
    }

    private static String get403HintKorean() {
        return "[점검 사항: ① 애플리케이션 시크릿이 $2a$10$... 형태로 올바른지 ② API Key와 시크릿이 동일 앱에서 발급한 쌍인지 ③ 서버 시각이 맞는지(타임스탬프 약 5분 유효) ④ 커머스API센터에서 요청 IP 허용 등록 여부. 자세한 내용은 apicenter.commerce.naver.com 인증 문서 참고]";
    }

    /** 영문 기술 에러 메시지를 사용자 친화적 한글로 변환 */
    private static String toUserFriendlyMessage(Throwable e) {
        if (e == null) return "잠시 후 다시 시도해 주세요.";
        String msg = e.getMessage();
        if (msg == null) msg = "";
        String lower = msg.toLowerCase();
        if (lower.contains("403") && lower.contains("http")) {
            return "네이버 API가 접근을 거부했습니다(403).";
        }
        if (lower.contains("pkix") || lower.contains("certification path") || lower.contains("unable to find valid cert") || lower.contains("sslhandshake") || lower.contains("sun.security.provider.certpath")) {
            return "SSL 인증서 검증에 실패했습니다. Java 신뢰 저장소에 네이버 API 인증서가 등록되어 있는지 확인해 주세요.";
        }
        if (lower.contains("connection refused") || lower.contains("connection reset")) {
            return "서버에 연결할 수 없습니다. 네트워크 연결을 확인해 주세요.";
        }
        if (lower.contains("timeout") || lower.contains("timed out")) {
            return "요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.";
        }
        if (!msg.isBlank()) return msg;
        return "잠시 후 다시 시도해 주세요.";
    }

    @Data
    private static class TokenResponse {
        @JsonProperty("access_token")
        private String accessToken;
        @JsonProperty("expires_in")
        private Long expiresIn;
    }
}
