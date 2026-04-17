package com.example.wxlogin.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.wxlogin.entity.GpuKnowledge;

import java.util.List;
import java.util.Map;

public interface KnowledgeService extends IService<GpuKnowledge> {

    /** 获取所有知识库列表 */
    List<GpuKnowledge> listAll();

    /** 按分类筛选 */
    List<GpuKnowledge> listByCategory(String category);

    /** 关键词搜索 */
    List<GpuKnowledge> search(String keyword, String category);

    /** 获取所有分类及统计 */
    Map<String, Object> getCategoryStats();

    /** 根据ID获取详情 */
    GpuKnowledge getById(Long id);
}
