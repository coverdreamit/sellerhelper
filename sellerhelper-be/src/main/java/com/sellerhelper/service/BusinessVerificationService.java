package com.sellerhelper.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BusinessVerificationService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Getter
    @Value("${app.business-verification.enabled:false}")
    private boolean verificationEnabled;

    @Value("${app.business-verification.service-key:}")
    private String serviceKey;

    @Value("${app.business-verification.status-api-url:https://api.odcloud.kr/api/nts-businessman/v1/status}")
    private String statusApiUrl;

    public String normalizeBusinessNumber(String rawBizNo) {
        if (!StringUtils.hasText(rawBizNo)) {
            return null;
        }
        String normalized = rawBizNo.replaceAll("[^0-9]", "");
        if (normalized.length() != 10) {
            throw new IllegalArgumentException("사업자등록번호는 숫자 10자리여야 합니다.");
        }
        return normalized;
    }

    public VerificationResult verifyBusinessStatus(String rawBizNo) {
        if (!verificationEnabled) {
            throw new IllegalStateException("사업자 검증 기능이 비활성화되어 있습니다.");
        }
        if (!StringUtils.hasText(serviceKey)) {
            throw new IllegalStateException("사업자 검증 API 서비스키가 설정되지 않았습니다.");
        }

        String bizNo = normalizeBusinessNumber(rawBizNo);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("b_no", Collections.singletonList(bizNo));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        String requestUrl = buildRequestUrl();
        ResponseEntity<String> response;
        try {
            response = restTemplate.exchange(URI.create(requestUrl), HttpMethod.POST, request, String.class);
        } catch (RestClientException ex) {
            throw new IllegalStateException("사업자 상태조회 API 호출에 실패했습니다.", ex);
        }

        return parseVerificationResult(bizNo, response.getBody());
    }

    private String buildRequestUrl() {
        String key = serviceKey.contains("%")
                ? serviceKey
                : URLEncoder.encode(serviceKey, StandardCharsets.UTF_8);
        String delimiter = statusApiUrl.contains("?") ? "&" : "?";
        return statusApiUrl + delimiter + "serviceKey=" + key;
    }

    private VerificationResult parseVerificationResult(String bizNo, String responseBody) {
        if (!StringUtils.hasText(responseBody)) {
            throw new IllegalStateException("사업자 상태조회 API 응답이 비어 있습니다.");
        }
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode statusCodeNode = root.get("status_code");
            if (statusCodeNode != null && !"OK".equalsIgnoreCase(statusCodeNode.asText())) {
                String message = root.path("message").asText("사업자 상태조회 API 응답 오류");
                throw new IllegalStateException(message);
            }

            JsonNode dataArray = root.path("data");
            if (!dataArray.isArray() || dataArray.isEmpty()) {
                throw new IllegalStateException("사업자 상태조회 결과를 찾을 수 없습니다.");
            }

            JsonNode first = dataArray.get(0);
            String businessStatusCode = textOrNull(first, "b_stt_cd");
            String businessStatusText = textOrNull(first, "b_stt");
            String taxType = textOrNull(first, "tax_type");
            String closedAt = textOrNull(first, "end_dt");

            boolean isValid = "01".equals(businessStatusCode)
                    || (businessStatusText != null && businessStatusText.contains("계속"));
            String message = isValid ? "정상 사업자입니다." : "휴업/폐업 또는 유효하지 않은 사업자 상태입니다.";

            return new VerificationResult(
                    bizNo,
                    isValid,
                    businessStatusCode,
                    businessStatusText,
                    taxType,
                    closedAt,
                    message,
                    Instant.now()
            );
        } catch (IOException ex) {
            throw new IllegalStateException("사업자 상태조회 API 응답 파싱에 실패했습니다.", ex);
        }
    }

    private String textOrNull(JsonNode node, String fieldName) {
        if (node == null) {
            return null;
        }
        String value = node.path(fieldName).asText(null);
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    @Getter
    @AllArgsConstructor
    public static class VerificationResult {
        private String normalizedBusinessNumber;
        private boolean verified;
        private String statusCode;
        private String statusText;
        private String taxType;
        private String closedAt;
        private String message;
        private Instant verifiedAt;
    }
}
