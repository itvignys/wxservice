package com.example.wxlogin.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.wxlogin.entity.CompanyInfo;
import com.example.wxlogin.mapper.CompanyInfoMapper;
import com.example.wxlogin.service.CompanyService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyServiceImpl extends ServiceImpl<CompanyInfoMapper, CompanyInfo> implements CompanyService {

    private final CompanyInfoMapper companyInfoMapper;

    @Override
    public CompanyInfo saveCompany(CompanyInfo info) {
        CompanyInfo exist = findByOpenid(info.getOpenid());
        if (exist != null) {
            // 更新
            exist.setName(info.getName());
            exist.setCreditCode(info.getCreditCode());
            exist.setContact(info.getContact());
            exist.setPhone(info.getPhone());
            exist.setAddress(info.getAddress());
            exist.setRemark(info.getRemark());
            exist.setGpuCount(info.getGpuCount());
            exist.setServices(info.getServices());
            exist.setStatus(info.getStatus());
            exist.setUpdatedAt(LocalDateTime.now());
            companyInfoMapper.updateById(exist);
            return exist;
        } else {
            // 新增
            info.setSubmitTime(LocalDateTime.now());
            info.setUpdatedAt(LocalDateTime.now());
            companyInfoMapper.insert(info);
            return info;
        }
    }

    @Override
    public CompanyInfo findByOpenid(String openid) {
        LambdaQueryWrapper<CompanyInfo> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CompanyInfo::getOpenid, openid);
        return companyInfoMapper.selectOne(wrapper);
    }
}
