package com.sellerhelper.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** 웹 설정 (CORS는 CorsConfig에서 CorsFilter로 처리) */
@Configuration
public class WebConfig implements WebMvcConfigurer {
}
