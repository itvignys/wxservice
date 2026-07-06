package com.example.wxlogin.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.example.wxlogin.entity.RecycleAddress;
import com.example.wxlogin.entity.RecycleCategory;
import com.example.wxlogin.mapper.RecycleAddressMapper;
import com.example.wxlogin.mapper.RecycleCategoryMapper;
import com.example.wxlogin.service.RecycleCategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 品类与地址服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RecycleCategoryServiceImpl implements RecycleCategoryService {

    private final RecycleCategoryMapper categoryMapper;
    private final RecycleAddressMapper addressMapper;

    @Override
    public List<RecycleCategory> getCategoryList() {
        LambdaQueryWrapper<RecycleCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(RecycleCategory::getSortOrder);
        return categoryMapper.selectList(wrapper);
    }

    @Override
    public List<RecycleAddress> getAddressList(String openid) {
        LambdaQueryWrapper<RecycleAddress> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RecycleAddress::getUserOpenid, openid);
        wrapper.orderByDesc(RecycleAddress::getIsDefault);
        return addressMapper.selectList(wrapper);
    }

    @Override
    @Transactional
    public RecycleAddress saveAddress(RecycleAddress address) {
        if (address.getIsDefault() != null && address.getIsDefault() == 1) {
            // 取消其他默认地址
            LambdaUpdateWrapper<RecycleAddress> updateWrapper = new LambdaUpdateWrapper<>();
            updateWrapper.eq(RecycleAddress::getUserOpenid, address.getUserOpenid());
            updateWrapper.set(RecycleAddress::getIsDefault, 0);
            addressMapper.update(null, updateWrapper);
        }

        if (address.getId() != null) {
            address.setUpdatedAt(LocalDateTime.now());
            addressMapper.updateById(address);
        } else {
            address.setCreatedAt(LocalDateTime.now());
            address.setUpdatedAt(LocalDateTime.now());
            addressMapper.insert(address);
        }
        return address;
    }

    @Override
    public void deleteAddress(Long id) {
        addressMapper.deleteById(id);
    }

    @Override
    @Transactional
    public RecycleAddress setDefault(Long id, String openid) {
        // 取消其他默认
        LambdaUpdateWrapper<RecycleAddress> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(RecycleAddress::getUserOpenid, openid);
        updateWrapper.set(RecycleAddress::getIsDefault, 0);
        addressMapper.update(null, updateWrapper);

        // 设置当前为默认
        RecycleAddress addr = addressMapper.selectById(id);
        if (addr != null) {
            addr.setIsDefault(1);
            addr.setUpdatedAt(LocalDateTime.now());
            addressMapper.updateById(addr);
        }
        return addr;
    }
}
