package com.example.wxlogin.service;

import com.example.wxlogin.entity.WxUser;

/**
 * 用户服务接口
 */
public interface UserService {

    /**
     * 微信小程序登录
     * 根据 code 调用微信接口获取 openid，并存储用户信息
     * @param code 小程序登录凭证
     * @return 登录结果
     */
    WxUser login(String code);

    /**
     * 根据 openid 查询用户
     * @param openid 微信用户唯一标识
     * @return 用户信息，未找到返回 null
     */
    WxUser findByOpenid(String openid);

    /**
     * 更新用户资料（昵称、头像、手机号、服务等级等）
     * @param userData 用户数据（需包含openid）
     * @return 更新后的用户信息
     */
    WxUser updateProfile(WxUser userData);
}
