package com.example.wxlogin.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.wxlogin.entity.GpuKnowledge;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface GpuKnowledgeMapper extends BaseMapper<GpuKnowledge> {

    /**
     * MySQL全文检索：按关键词搜索知识库（ngram分词）
     * 使用布尔模式，支持+/-逻辑
     */
    @Select("SELECT * FROM gpu_knowledge " +
            "WHERE MATCH(question, causes, diagnosis, solution) AGAINST(#{keyword} IN BOOLEAN MODE) " +
            "ORDER BY sort_order ASC LIMIT #{limit}")
    List<GpuKnowledge> fullTextSearch(@Param("keyword") String keyword, @Param("limit") int limit);

    /**
     * 当FTS无结果时的降级模糊搜索
     */
    @Select("SELECT * FROM gpu_knowledge " +
            "WHERE question LIKE CONCAT('%', #{keyword}, '%') " +
            "OR causes LIKE CONCAT('%', #{keyword}, '%') " +
            "OR diagnosis LIKE CONCAT('%', #{keyword}, '%') " +
            "OR solution LIKE CONCAT('%', #{keyword}, '%') " +
            "ORDER BY sort_order ASC LIMIT #{limit}")
    List<GpuKnowledge> fallbackSearch(@Param("keyword") String keyword, @Param("limit") int limit);
}
