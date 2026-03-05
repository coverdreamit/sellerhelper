package com.sellerhelper.core.security;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * JWT 필터에서 인증 없이 허용할 경로 판단
 */
@FunctionalInterface
public interface JwtRequestMatcher {
    boolean isPermitAll(HttpServletRequest request);

    static JwtRequestMatcher paths(String... paths) {
        return request -> {
            String uri = request.getRequestURI();
            String contextPath = request.getContextPath();
            String path = uri.startsWith(contextPath) ? uri.substring(contextPath.length()) : uri;
            for (String p : paths) {
                if (path.startsWith(p)) return true;
            }
            return false;
        };
    }

    static JwtRequestMatcher fromList(List<String> paths) {
        return paths(paths.toArray(new String[0]));
    }
}
