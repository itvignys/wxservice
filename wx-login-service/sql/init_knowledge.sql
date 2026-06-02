-- GPU知识库表：全文检索增强
-- 执行前请确保数据库字符集为 utf8mb4

-- 如果表已存在，先添加FULLTEXT索引（MySQL 5.7+ 支持ngram解析器）
-- 注意： FULLTEXT索引只能在MyISAM或InnoDB引擎（MySQL 5.6+）上创建

-- 为已存在的gpu_knowledge表添加ngram全文索引
ALTER TABLE gpu_knowledge
ADD FULLTEXT INDEX ft_knowledge (question, causes, diagnosis, solution) WITH PARSER ngram COMMENT 'ngram全文检索，支持中文分词';

-- 如果gpu_knowledge表不存在，使用以下建表语句（包含FTS）
CREATE TABLE IF NOT EXISTS gpu_knowledge (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    category VARCHAR(64) DEFAULT NULL COMMENT '问题分类',
    question TEXT NOT NULL COMMENT '问题描述',
    causes TEXT DEFAULT NULL COMMENT '常见原因',
    diagnosis TEXT DEFAULT NULL COMMENT '排查方法',
    solution TEXT DEFAULT NULL COMMENT '维修方案',
    difficulty VARCHAR(32) DEFAULT NULL COMMENT '难度评估',
    cost VARCHAR(64) DEFAULT NULL COMMENT '维修成本',
    success_rate VARCHAR(32) DEFAULT NULL COMMENT '成功率',
    sort_order INT DEFAULT 0 COMMENT '排序序号',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    INDEX idx_category (category),
    INDEX idx_sort_order (sort_order),
    FULLTEXT INDEX ft_knowledge (question, causes, diagnosis, solution) WITH PARSER ngram COMMENT 'ngram全文检索，支持中文分词'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='GPU显卡维修知识库';
