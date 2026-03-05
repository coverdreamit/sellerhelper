package com.sellerhelper.core.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret:sellerhelper-secret-key-at-least-32-bytes-long}")
    private String secretKey;

    @Value("${jwt.expiration:86400000}")
    private long tokenValidityInMs;

    private byte[] keyBytes;

    @PostConstruct
    protected void init() {
        this.keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            this.keyBytes = padded;
        }
    }

    /**
     * 로그인 성공 시 토큰 생성 (Portal에서 호출)
     */
    public String createToken(Long uid, String loginId, String name, List<String> roleCodes, Long companyUid) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + tokenValidityInMs);
        return Jwts.builder()
                .setSubject(String.valueOf(uid))
                .claim("loginId", loginId)
                .claim("name", name)
                .claim("roles", roleCodes)
                .claim("companyUid", companyUid != null ? companyUid : (Object) null)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(Keys.hmacShaKeyFor(keyBytes), SignatureAlgorithm.HS256)
                .compact();
    }

    public Authentication getAuthentication(String token) {
        Claims claims = parseClaims(token);
        String uidStr = claims.getSubject();
        Long uid = Long.parseLong(uidStr);
        String loginId = claims.get("loginId", String.class);
        String name = claims.get("name", String.class);
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) claims.get("roles");
        Long companyUid = claims.get("companyUid", Long.class);
        AuthUser authUser = new AuthUser(uid, loginId, name, roles, companyUid);
        List<GrantedAuthority> authorities = authUser.getRoleCodes().stream()
                .map(rc -> new SimpleGrantedAuthority("ROLE_" + rc))
                .collect(Collectors.toList());
        return new UsernamePasswordAuthenticationToken(authUser, null, authorities);
    }

    public Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(keyBytes))
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(keyBytes))
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.debug("JWT expired: {}", e.getMessage());
        } catch (UnsupportedJwtException | MalformedJwtException | SignatureException | IllegalArgumentException e) {
            log.debug("JWT invalid: {}", e.getMessage());
        }
        return false;
    }

    public void validateTokenOrThrow(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(keyBytes))
                    .build()
                    .parseClaimsJws(token);
        } catch (ExpiredJwtException e) {
            throw new JwtValidationException(JwtValidationException.JwtErrorCode.EXPIRED);
        } catch (MalformedJwtException | SignatureException | UnsupportedJwtException | IllegalArgumentException e) {
            throw new JwtValidationException(JwtValidationException.JwtErrorCode.MALFORMED);
        } catch (Exception e) {
            throw new JwtValidationException(JwtValidationException.JwtErrorCode.INVALID);
        }
    }
}
