package com.example.wxlogin.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.wxlogin.entity.WxUser;
import com.example.wxlogin.mapper.WxUserMapper;
import com.example.wxlogin.service.UserService;
import com.example.wxlogin.util.WechatUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 用户服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final WxUserMapper wxUserMapper;
    private final WechatUtil wechatUtil;

    @Override
    @Transactional
    public WxUser login(String code) {
        // 调用微信接口获取 openid 和 session_key
        WechatUtil.LoginResult loginResult = wechatUtil.code2Session(code);

        if (loginResult == null || loginResult.getErrcode() != null && loginResult.getErrcode() != 0) {
            log.error("微信登录失败: {}", loginResult != null ? loginResult.getErrmsg() : "未知错误");
            throw new RuntimeException(loginResult != null ? loginResult.getErrmsg() : "微信登录失败");
        }

        String openid = loginResult.getOpenid();
        String sessionKey = loginResult.getSession_key();
        String unionid = loginResult.getUnionid();

        // 查询用户是否已存在
        WxUser existUser = findByOpenid(openid);

        if (existUser != null) {
            // 用户已存在，更新 session_key
            existUser.setSessionKey(sessionKey);
            existUser.setUpdatedAt(LocalDateTime.now());
            wxUserMapper.updateById(existUser);
            log.info("用户已存在，更新 session_key: {}", openid);
            return existUser;
        } else {
            // 新用户，创建记录
            WxUser newUser = new WxUser();
            newUser.setOpenid(openid);
            newUser.setSessionKey(sessionKey);
            newUser.setUnionid(unionid);
            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setUpdatedAt(LocalDateTime.now());
            wxUserMapper.insert(newUser);
            log.info("新用户创建成功: {}", openid);
            return newUser;
        }
    }

    @Override
    public WxUser findByOpenid(String openid) {
        LambdaQueryWrapper<WxUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WxUser::getOpenid, openid);
        return wxUserMapper.selectOne(wrapper);
    }

    @Override
    public WxUser updateProfile(WxUser userData) {
        WxUser existUser = findByOpenid(userData.getOpenid());
        if (existUser == null) {
            throw new RuntimeException("用户不存在");
        }

        // 只更新允许修改的字段
        if (userData.getNickname() != null) {
            existUser.setNickname(userData.getNickname());
        }
        if (userData.getAvatarUrl() != null) {
            existUser.setAvatarUrl(userData.getAvatarUrl());
        }
        if (userData.getPhone() != null) {
            existUser.setPhone(userData.getPhone());
        }
        if (userData.getServiceLevel() != null) {
            existUser.setServiceLevel(userData.getServiceLevel());
        }
        existUser.setUpdatedAt(LocalDateTime.now());
        wxUserMapper.updateById(existUser);
        log.info("用户资料更新成功: {}", userData.getOpenid());
        return existUser;
    }

    @Override
    @Transactional
    public WxUser loginByPhone(String phone) {
        // 先根据手机号查找用户
        WxUser existUser = findByPhone(phone);

        if (existUser != null) {
            // 用户已存在，更新登录时间
            existUser.setUpdatedAt(LocalDateTime.now());
            wxUserMapper.updateById(existUser);
            log.info("App 用户登录成功: {}, openid: {}", phone, existUser.getOpenid());
            return existUser;
        } else {
            // 新用户，自动注册
            WxUser newUser = new WxUser();
            // 生成 app_ 前缀的 openid，确保唯一性
            String openid = "app_" + phone + "_" + System.currentTimeMillis();
            newUser.setOpenid(openid);
            newUser.setPhone(phone);
            newUser.setNickname("手机用户" + phone.substring(phone.length() - 4));
            newUser.setServiceLevel(0);
            newUser.setRole("customer");
            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setUpdatedAt(LocalDateTime.now());
            wxUserMapper.insert(newUser);
            log.info("App 新用户注册成功: {}, openid: {}", phone, openid);
            return newUser;
        }
    }

    @Override
    public WxUser findByPhone(String phone) {
        LambdaQueryWrapper<WxUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WxUser::getPhone, phone);
        return wxUserMapper.selectOne(wrapper);
    }

}
