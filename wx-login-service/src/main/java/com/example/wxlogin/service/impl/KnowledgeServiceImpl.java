package com.example.wxlogin.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.wxlogin.entity.GpuKnowledge;
import com.example.wxlogin.mapper.GpuKnowledgeMapper;
import com.example.wxlogin.service.KnowledgeService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgeServiceImpl extends ServiceImpl<GpuKnowledgeMapper, GpuKnowledge> implements KnowledgeService {

    private final GpuKnowledgeMapper knowledgeMapper;

    @Override
    public List<GpuKnowledge> listAll() {
        LambdaQueryWrapper<GpuKnowledge> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(GpuKnowledge::getSortOrder);
        return knowledgeMapper.selectList(wrapper);
    }

    @Override
    public List<GpuKnowledge> listByCategory(String category) {
        LambdaQueryWrapper<GpuKnowledge> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(category) && !"全部".equals(category)) {
            wrapper.eq(GpuKnowledge::getCategory, category);
        }
        wrapper.orderByAsc(GpuKnowledge::getSortOrder);
        return knowledgeMapper.selectList(wrapper);
    }

    @Override
    public List<GpuKnowledge> search(String keyword, String category) {
        // 优先使用MySQL FULLTEXT全文检索（当有关键词且无分类筛选时）
        if (StringUtils.hasText(keyword) && (!StringUtils.hasText(category) || "全部".equals(category))) {
            String ftKeyword = keyword.trim();
            // 过滤 MySQL 布尔模式特殊字符，防止语法错误
            ftKeyword = ftKeyword.replaceAll("[+\\-<>()~*\"@]", " ");
            if (!StringUtils.hasText(ftKeyword)) {
                // 关键字全是特殊字符，降级到原模糊查询
            } else {
                // 简单处理：为每个词加上+前缀以增强相关度排序（布尔模式）
                String[] words = ftKeyword.split("\\s+");
                String booleanQuery = java.util.Arrays.stream(words)
                        .filter(w -> w.length() >= 2)
                        .map(w -> "+" + w)
                        .collect(java.util.stream.Collectors.joining(" "));
                try {
                    List<GpuKnowledge> ftResult = knowledgeMapper.fullTextSearch(booleanQuery, 50);
                    if (!ftResult.isEmpty()) {
                        log.info("知识库FTS命中: keyword={}, result={}", keyword, ftResult.size());
                        return ftResult;
                    }
                    // FTS无结果，降级到模糊搜索
                    List<GpuKnowledge> fallback = knowledgeMapper.fallbackSearch(ftKeyword, 50);
                    log.info("知识库FTS无结果，降级LIKE搜索: keyword={}, result={}", keyword, fallback.size());
                    return fallback;
                } catch (Exception e) {
                    log.warn("全文检索异常，降级到LIKE查询: {}", e.getMessage());
                    // 降级到原模糊查询
                }
            }
        }

        LambdaQueryWrapper<GpuKnowledge> wrapper = new LambdaQueryWrapper<>();

        // 分类筛选
        if (StringUtils.hasText(category) && !"全部".equals(category)) {
            wrapper.eq(GpuKnowledge::getCategory, category);
        }

        // 关键词搜索（模糊匹配多个字段）
        if (StringUtils.hasText(keyword)) {
            String kw = keyword.trim().toLowerCase();
            wrapper.and(w -> w
                .like(GpuKnowledge::getQuestion, kw)
                .or().like(GpuKnowledge::getCauses, kw)
                .or().like(GpuKnowledge::getDiagnosis, kw)
                .or().like(GpuKnowledge::getSolution, kw)
                .or().like(GpuKnowledge::getCategory, kw)
            );
        }

        wrapper.orderByAsc(GpuKnowledge::getSortOrder);
        return knowledgeMapper.selectList(wrapper);
    }

    @Override
    public Map<String, Object> getCategoryStats() {
        List<GpuKnowledge> allList = listAll();
        Map<String, Long> stats = allList.stream()
            .collect(Collectors.groupingBy(
                GpuKnowledge::getCategory,
                LinkedHashMap::new,
                Collectors.counting()
            ));

        // 获取所有分类（按出现顺序）
        List<String> categories = stats.keySet().stream().collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("categories", categories);
        result.put("stats", stats);
        result.put("totalCount", allList.size());
        return result;
    }

    @Override
    public GpuKnowledge getById(Long id) {
        return knowledgeMapper.selectById(id);
    }
}
