package com.example.wxlogin.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.wxlogin.entity.CompanyInfo;

public interface CompanyService extends IService<CompanyInfo> {

    /** 保存或更新企业信息（自定义逻辑） */
    CompanyInfo saveCompany(CompanyInfo companyInfo);

    /** 根据openid查询企业信息 */
    CompanyInfo findByOpenid(String openid);
}
