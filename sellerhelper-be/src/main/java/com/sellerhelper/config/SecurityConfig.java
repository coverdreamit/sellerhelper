package com.sellerhelper.config;

import com.sellerhelper.core.security.JwtAuthenticationFilter;
import com.sellerhelper.core.security.JwtRequestMatcher;
import com.sellerhelper.core.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.Map;

/**
 * JWT 토큰 인증 (Portal에서 발급한 토큰 검증)
 * - /api/health, /api/app/config: 인증 없이 허용
 * - 그 외 /api/**: Authorization: Bearer &lt;token&gt; 필요
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String[] PERMIT_PATHS = {
            "/api/health",
            "/api/app/config",
            "/actuator/**",
            "/error"
    };

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring().antMatchers("/actuator/**", "/error");
    }

    @Bean
    public JwtRequestMatcher jwtRequestMatcher() {
        return JwtRequestMatcher.paths(PERMIT_PATHS);
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider,
                                                         JwtRequestMatcher jwtRequestMatcher) {
        return new JwtAuthenticationFilter(jwtTokenProvider, jwtRequestMatcher);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, ObjectMapper objectMapper,
                                                   JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeRequests(auth -> auth
                        .antMatchers(PERMIT_PATHS).permitAll()
                        .antMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, authEx) -> {
                            res.setStatus(401);
                            res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            res.setCharacterEncoding("UTF-8");
                            res.getWriter().write(objectMapper.writeValueAsString(Map.of(
                                    "status", 401,
                                    "error", "Unauthorized",
                                    "message", "로그인이 필요합니다."
                            )));
                        }))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
