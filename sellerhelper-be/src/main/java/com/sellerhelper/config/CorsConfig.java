package com.sellerhelper.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * CORS 필터 - OPTIONS preflight 등 요청을 가장 먼저 처리하여
 * "Invalid CORS request" 오류 방지.
 * 개발 모드: localhost/127.0.0.1 모든 포트 허용 패턴 사용
 */
@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins:}")
    private String allowedOriginsConfig;

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilterRegistration() {
        CorsConfiguration config = new CorsConfiguration();
        if (StringUtils.hasText(allowedOriginsConfig)) {
            List<String> origins = Arrays.stream(allowedOriginsConfig.split(","))
                    .map(String::trim)
                    .filter(StringUtils::hasText)
                    .collect(Collectors.toList());
            config.setAllowedOrigins(origins);
        } else {
            // 개발용: localhost/127.0.0.1 모든 포트 허용 (패턴)
            config.setAllowedOriginPatterns(List.of(
                    "http://localhost*",
                    "http://127.0.0.1*",
                    "http://[::1]*",
                    "https://localhost*",
                    "https://127.0.0.1*"
            ));
        }
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
}
