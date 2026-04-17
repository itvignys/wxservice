package com.example.wxlogin.controller;

import com.example.wxlogin.dto.ApiResponse;
import com.example.wxlogin.dto.LoginRequest;
import com.example.wxlogin.entity.WxUser;
import com.example.wxlogin.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 用户 REST 控制器
 * 提供微信小程序登录和用户信息管理接口
 */
@Slf4j
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 微信小程序登录
     * 接收小程序传来的 code，调用微信接口换取 openid 并存储
     */
    @PostMapping("/login")
    public ApiResponse<WxUser> login(@Validated @RequestBody LoginRequest request) {
        log.info("收到登录请求，code: {}", request.getCode());
        try {
            WxUser user = userService.login(request.getCode());
            return ApiResponse.success("登录成功", user);
        } catch (Exception e) {
            log.error("登录失败", e);
            return ApiResponse.fail(e.getMessage());
        }
    }

    /**
     * 根据 openid 查询用户
     */
    @GetMapping("/{openid}")
    public ApiResponse<WxUser> getUser(@PathVariable String openid) {
        log.info("查询用户，openid: {}", openid);
        WxUser user = userService.findByOpenid(openid);
        if (user == null) {
            return ApiResponse.fail("用户不存在");
        }
        return ApiResponse.success(user);
    }

    /**
     * 更新用户资料
     * PUT /api/user/profile
     *
     * 请求体: { nickname, avatarUrl, phone, serviceLevel }
     */
    @PutMapping("/profile")
    public ApiResponse<WxUser> updateProfile(@RequestBody WxUser userData) {
        log.info("更新用户资料，openid: {}", userData.getOpenid());
        try {
            WxUser updated = userService.updateProfile(userData);
            return ApiResponse.success("更新成功", updated);
        } catch (Exception e) {
            log.error("更新用户资料失败", e);
            return ApiResponse.fail(e.getMessage());
        }
    }
}
