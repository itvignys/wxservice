package com.example.wxlogin.controller;

import com.example.wxlogin.dto.ApiResponse;
import com.example.wxlogin.entity.GpuKnowledge;
import com.example.wxlogin.service.KnowledgeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 知识库 REST 控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/knowledge")
@RequiredArgsConstructor
public class KnowledgeController {

    private final KnowledgeService knowledgeService;

    /**
     * 获取知识库列表（支持分类筛选）
     * GET /api/knowledge/list?category=全部
     */
    @GetMapping("/list")
    public ApiResponse<List<GpuKnowledge>> list(
            @RequestParam(required = false, defaultValue = "全部") String category) {
        log.info("获取知识库列表，分类: {}", category);
        List<GpuKnowledge> list = knowledgeService.listByCategory(category);
        return ApiResponse.success(list);
    }

    /**
     * 获取分类列表及统计信息
     * GET /api/knowledge/categories
     */
    @GetMapping("/categories")
    public ApiResponse<Map<String, Object>> categories() {
        Map<String, Object> stats = knowledgeService.getCategoryStats();
        return ApiResponse.success(stats);
    }

    /**
     * 搜索知识库
     * GET /api/knowledge/search?keyword=黑屏&category=
     */
    @GetMapping("/search")
    public ApiResponse<List<GpuKnowledge>> search(
            @RequestParam String keyword,
            @RequestParam(required = false, defaultValue = "全部") String category) {
        log.info("搜索知识库，关键词: {}, 分类: {}", keyword, category);
        List<GpuKnowledge> result = knowledgeService.search(keyword, category);
        return ApiResponse.success(result);
    }

    /**
     * 根据ID获取详情
     * GET /api/knowledge/{id}
     */
    @GetMapping("/{id}")
    public ApiResponse<GpuKnowledge> detail(@PathVariable Long id) {
        GpuKnowledge knowledge = knowledgeService.getById(id);
        if (knowledge == null) {
            return ApiResponse.fail("知识条目不存在");
        }
        return ApiResponse.success(knowledge);
    }
}
