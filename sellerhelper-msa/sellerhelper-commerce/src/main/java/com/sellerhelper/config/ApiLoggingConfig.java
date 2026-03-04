package com.sellerhelper.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.BufferingClientHttpRequestFactory;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

/**
 * API 호출 시 요청/응답을 콘솔(로그)에 남기는 RestTemplate 설정.
 */
@Configuration
public class ApiLoggingConfig {

    private static final Logger log = LoggerFactory.getLogger("API");

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate(
                new BufferingClientHttpRequestFactory(new SimpleClientHttpRequestFactory()));
        restTemplate.setInterceptors(Collections.singletonList(apiLoggingInterceptor()));
        return restTemplate;
    }

    private ClientHttpRequestInterceptor apiLoggingInterceptor() {
        return (HttpRequest request, byte[] body, ClientHttpRequestExecution execution) -> {
            logRequest(request, body);
            ClientHttpResponse response = execution.execute(request, body);
            return logResponse(response);
        };
    }

    private void logRequest(HttpRequest request, byte[] body) {
        if (!log.isInfoEnabled()) return;
        String method = request.getMethod().name();
        String uri = request.getURI().toString();
        String maskedUri = maskUri(uri);
        log.info("[API 요청] {} {}", method, maskedUri);
        request.getHeaders().forEach((name, values) -> {
            if ("Authorization".equalsIgnoreCase(name)) {
                log.info("  Header: {} = ***", name);
            } else {
                log.info("  Header: {} = {}", name, values);
            }
        });
        if (body != null && body.length > 0) {
            String bodyStr = new String(body, StandardCharsets.UTF_8);
            log.info("  Body: {}", maskBody(bodyStr));
        }
    }

    private ClientHttpResponse logResponse(ClientHttpResponse response) throws IOException {
        byte[] body = StreamUtils.copyToByteArray(response.getBody());
        if (log.isInfoEnabled()) {
            int status = response.getStatusCode().value();
            String bodyStr = body.length > 0 ? new String(body, StandardCharsets.UTF_8) : "";
            log.info("[API 응답] status={} body={}", status, truncate(bodyStr, 2000));
        }
        return new BufferedClientHttpResponse(response, body);
    }

    private String maskUri(String uri) {
        if (uri == null) return "";
        return uri.replaceAll("([?&])(client_secret_sign)=[^&]*", "$1$2=***");
    }

    private String maskBody(String body) {
        if (body == null) return "";
        return body
                .replaceAll("(\"client_secret_sign\"\\s*:\\s*\")[^\"]*\"", "$1***\"")
                .replaceAll("(\"access_token\"\\s*:\\s*\")[^\"]*\"", "$1***\"")
                .replaceAll("(\"client_secret\"\\s*:\\s*\")[^\"]*\"", "$1***\"")
                .replaceAll("(client_secret_sign=)[^&]*", "$1***");
    }

    private String truncate(String s, int maxLen) {
        if (s == null) return "";
        if (s.length() <= maxLen) return s;
        return s.substring(0, maxLen) + "...(생략 " + (s.length() - maxLen) + "자)";
    }

    /** 응답 본문을 버퍼에 담아 여러 번 읽을 수 있게 하는 래퍼 */
    private static class BufferedClientHttpResponse implements ClientHttpResponse {
        private final ClientHttpResponse delegate;
        private final byte[] body;

        BufferedClientHttpResponse(ClientHttpResponse delegate, byte[] body) {
            this.delegate = delegate;
            this.body = body;
        }

        @Override
        public HttpStatus getStatusCode() throws IOException {
            return delegate.getStatusCode();
        }

        @Override
        public int getRawStatusCode() throws IOException {
            return delegate.getRawStatusCode();
        }

        @Override
        public String getStatusText() throws IOException {
            return delegate.getStatusText();
        }

        @Override
        public void close() {
            delegate.close();
        }

        @Override
        public InputStream getBody() {
            return new ByteArrayInputStream(body);
        }

        @Override
        public org.springframework.http.HttpHeaders getHeaders() {
            return delegate.getHeaders();
        }
    }
}
