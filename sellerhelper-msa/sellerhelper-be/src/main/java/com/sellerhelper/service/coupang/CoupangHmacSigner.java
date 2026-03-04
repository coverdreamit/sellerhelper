package com.sellerhelper.service.coupang;

import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * 쿠팡 Open API HMAC-SHA256 서명 생성.
 * 요청마다 datetime + method + path + query 로 메시지 구성 후 서명.
 * @see https://developers.coupangcorp.com
 */
@Slf4j
public final class CoupangHmacSigner {

    private static final String ALGORITHM = "HmacSHA256";
    private static final String AUTH_SCHEME = "CEA algorithm=HmacSHA256";
    /** signed-date 형식: yymmddThhmmssZ (예: 240226T123456Z) */
    private static final DateTimeFormatter SIGNED_DATE_FORMAT =
            DateTimeFormatter.ofPattern("yyMMdd'T'HHmmss'Z'").withZone(ZoneOffset.UTC);

    private CoupangHmacSigner() {}

    /**
     * Authorization 헤더 값 생성.
     * @param accessKey API Access Key (CLIENT_KEY)
     * @param secretKey API Secret Key
     * @param method HTTP method (GET, POST, ...)
     * @param path URL path (e.g. /v2/providers/seller_api/apis/api/v1/...)
     * @param query query string (e.g. maxPerPage=20), 빈 문자열 가능
     */
    public static String createAuthorizationHeader(String accessKey, String secretKey,
                                                  String method, String path, String query) {
        if (!StringUtils.hasText(accessKey) || !StringUtils.hasText(secretKey)) {
            throw new IllegalArgumentException("쿠팡 API Access Key와 Secret Key가 필요합니다.");
        }
        String signedDate = SIGNED_DATE_FORMAT.format(Instant.now());
        String queryPart = query != null ? query : "";
        String message = signedDate + method + path + queryPart;
        String signature = hmacSha256Hex(secretKey, message);
        return AUTH_SCHEME + ", access-key=" + accessKey + ", signed-date=" + signedDate + ", signature=" + signature;
    }

    public static String createSignedDate() {
        return SIGNED_DATE_FORMAT.format(Instant.now());
    }

    private static String hmacSha256Hex(String secretKey, String message) {
        try {
            Mac mac = Mac.getInstance(ALGORITHM);
            mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), ALGORITHM));
            byte[] hash = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (Exception e) {
            log.warn("HMAC 서명 생성 실패: {}", e.getMessage());
            throw new IllegalStateException("HMAC 서명 생성 실패", e);
        }
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format(Locale.ROOT, "%02x", b & 0xff));
        }
        return sb.toString();
    }
}
