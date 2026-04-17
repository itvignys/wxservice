package com.example.wxlogin.controller;

import com.example.wxlogin.dto.ApiResponse;
import com.example.wxlogin.entity.CompanyInfo;
import com.example.wxlogin.service.CompanyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 企业信息 REST 控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    /**
     * 保存或更新企业信息
     * POST /api/company/save
     */
    @PostMapping("/save")
    public ApiResponse<CompanyInfo> save(@RequestBody CompanyInfo companyInfo) {
        log.info("保存企业信息，openid: {}, 企业名: {}", companyInfo.getOpenid(), companyInfo.getName());
        try {
            CompanyInfo saved = companyService.saveCompany(companyInfo);
            return ApiResponse.success("保存成功", saved);
        } catch (Exception e) {
            log.error("保存企业信息失败", e);
            return ApiResponse.fail("保存失败: " + e.getMessage());
        }
    }

    /**
     * 根据openid查询企业信息
     * GET /api/company/{openid}
     */
    @GetMapping("/{openid}")
    public ApiResponse<CompanyInfo> getCompany(@PathVariable String openid) {
        CompanyInfo info = companyService.findByOpenid(openid);
        if (info == null) {
            return ApiResponse.fail(0,"企业信息不存在");
        }
        return ApiResponse.success(info);
    }
}
