package com.example.wxlogin.service;

import com.example.wxlogin.entity.RecycleAddress;
import com.example.wxlogin.entity.RecycleCategory;

import java.util.List;

/**
 * 品类与地址服务接口
 */
public interface RecycleCategoryService {

    /** 获取所有品类 */
    List<RecycleCategory> getCategoryList();

    /** 获取用户地址列表 */
    List<RecycleAddress> getAddressList(String openid);

    /** 保存地址 */
    RecycleAddress saveAddress(RecycleAddress address);

    /** 删除地址 */
    void deleteAddress(Long id);

    /** 设默认地址 */
    RecycleAddress setDefault(Long id, String openid);
}
