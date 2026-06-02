package com.example.wxlogin.interceptor;

import com.example.wxlogin.config.AdminAuthConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * 管理后台权限拦截器
 * 拦截 /api/ai/admin/* 路径，验证请求者是否为运营人员
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminAuthInterceptor implements HandlerInterceptor {

    private final AdminAuthConfig adminAuthConfig;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 从 Header 获取 openid
        String openid = request.getHeader("X-Openid");
        if (openid == null || openid.isEmpty()) {
            // 尝试从 Authorization Bearer token 中解析（如果前端统一用token）
            openid = extractOpenidFromToken(request);
        }

        // 检查白名单
        if (!adminAuthConfig.isAdmin(openid)) {
            log.warn("非法访问管理后台, openid={}, uri={}, ip={}",
                openid, request.getRequestURI(), request.getRemoteAddr());
            writeError(response, 403, "无权限访问管理后台");
            return false;
        }

        log.debug("管理后台访问通过, openid={}, uri={}", openid, request.getRequestURI());
        return true;
    }

    private String extractOpenidFromToken(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            // 这里简化处理：如果token就是openid，直接返回
            // 实际项目中应从token解析出openid
            return auth.substring(7);
        }
        return null;
    }

    private void writeError(HttpServletResponse response, int code, String message) throws IOException {
        response.setStatus(403);
        response.setContentType("application/json;charset=UTF-8");
        Map<String, Object> result = new HashMap<>();
        result.put("code", code);
        result.put("message", message);
        result.put("data", null);
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }
}
