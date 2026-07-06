package com.example.wxlogin.controller;

import com.example.wxlogin.dto.ApiResponse;
import com.example.wxlogin.entity.RecycleAddress;
import com.example.wxlogin.entity.RecycleCategory;
import com.example.wxlogin.entity.RecycleModel;
import com.example.wxlogin.service.RecycleCategoryService;
import com.example.wxlogin.service.RecyclePriceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 品类与地址 REST 控制器
 * 路径前缀: /api/recycle/category 和 /api/recycle/address
 */
@Slf4j
@RestController
@RequestMapping("/api/recycle")
@RequiredArgsConstructor
public class RecycleCategoryController {

    private final RecycleCategoryService categoryService;
    private final RecyclePriceService priceService;

    // ========== 品类 ==========

    /** 获取品类列表 */
    @GetMapping("/category/list")
    public ApiResponse<List<RecycleCategory>> getCategoryList() {
        return ApiResponse.success(categoryService.getCategoryList());
    }

    /** 获取热门型号 */
    @GetMapping("/category/hot-models")
    public ApiResponse<List<RecycleModel>> getHotModels() {
        return ApiResponse.success(priceService.getHotModels());
    }

    // ========== 地址 ==========

    /** 获取用户地址列表 */
    @GetMapping("/address/list")
    public ApiResponse<List<RecycleAddress>> getAddressList(@RequestHeader("X-Openid") String openid) {
        return ApiResponse.success(categoryService.getAddressList(openid));
    }

    /** 保存地址 */
    @PostMapping("/address/save")
    public ApiResponse<RecycleAddress> saveAddress(@RequestBody RecycleAddress address,
                                                    @RequestHeader("X-Openid") String openid) {
        try {
            address.setUserOpenid(openid);
            return ApiResponse.success("保存成功", categoryService.saveAddress(address));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 删除地址 */
    @DeleteMapping("/address/{id}")
    public ApiResponse<Void> deleteAddress(@PathVariable Long id) {
        categoryService.deleteAddress(id);
        return ApiResponse.success("删除成功", null);
    }

    /** 设默认地址 */
    @PutMapping("/address/default/{id}")
    public ApiResponse<RecycleAddress> setDefault(@PathVariable Long id,
                                                   @RequestHeader("X-Openid") String openid) {
        try {
            return ApiResponse.success(categoryService.setDefault(id, openid));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }
}
