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
