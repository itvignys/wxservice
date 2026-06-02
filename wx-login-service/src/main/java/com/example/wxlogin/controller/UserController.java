package com.example.wxlogin.controller;

import com.example.wxlogin.dto.ApiResponse;
import com.example.wxlogin.dto.AppLoginRequest;
import com.example.wxlogin.dto.LoginRequest;
import com.example.wxlogin.dto.SmsSendRequest;
import com.example.wxlogin.entity.WxUser;
import com.example.wxlogin.service.SmsCodeService;
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
    private final SmsCodeService smsCodeService;

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

    /**
     * 发送短信验证码
     * POST /api/user/sms/send
     *
     * 请求体: { phone }
     * 演示环境直接返回验证码，生产环境应调用短信网关
     */
    @PostMapping("/sms/send")
    public ApiResponse<String> sendSmsCode(@Validated @RequestBody SmsSendRequest request) {
        log.info("请求发送验证码，手机号: {}", request.getPhone());
        try {
            String code = smsCodeService.sendCode(request.getPhone());
            // 演示环境：直接返回验证码给前端，方便测试
            // 生产环境：应删除返回的 code，仅返回 "发送成功"
            return ApiResponse.success("验证码已发送", code);
        } catch (Exception e) {
            log.error("发送验证码失败", e);
            return ApiResponse.fail(e.getMessage());
        }
    }

    /**
     * App 端手机号验证码登录
     * POST /api/user/login/app
     *
     * 请求体: { phone, verifyCode }
     * 手机号不存在则自动注册
     */
    @PostMapping("/login/app")
    public ApiResponse<WxUser> appLogin(@Validated @RequestBody AppLoginRequest request) {
        log.info("App 登录请求，手机号: {}", request.getPhone());
        try {
            // 校验验证码
            boolean verified = smsCodeService.verifyCode(request.getPhone(), request.getVerifyCode());
            if (!verified) {
                return ApiResponse.fail("验证码错误或已过期");
            }

            // 登录/注册
            WxUser user = userService.loginByPhone(request.getPhone());
            return ApiResponse.success("登录成功", user);
        } catch (Exception e) {
            log.error("App 登录失败", e);
            return ApiResponse.fail(e.getMessage());
        }
    }
}
