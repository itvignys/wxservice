-- AI对话记录表：持久化所有AI问答，形成可检索的数据资产
-- 执行前请确保数据库字符集为 utf8mb4

CREATE TABLE IF NOT EXISTS ai_conversation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id VARCHAR(64) DEFAULT NULL COMMENT '用户标识（openid或user_id）',
    session_id VARCHAR(64) DEFAULT NULL COMMENT '会话ID，用于串联同一轮对话',
    question TEXT NOT NULL COMMENT '用户问题',
    answer TEXT NOT NULL COMMENT 'AI回答',
    image_base64 MEDIUMTEXT DEFAULT NULL COMMENT '图片Base64（含MIME前缀）',
    source VARCHAR(32) DEFAULT 'yuanbao' COMMENT '回答来源：yuanbao=元宝AI, knowledge=知识库, fallback=兜底',
    is_helpful TINYINT DEFAULT NULL COMMENT '用户反馈：1=有用, 0=无用, NULL=未评价',
    distilled TINYINT DEFAULT 0 COMMENT '是否已知识提纯：0=未处理, 1=已处理',
    tags JSON DEFAULT NULL COMMENT 'AI自动标签（JSON数组）',
    metadata JSON DEFAULT NULL COMMENT '扩展元数据：如匹配的知识库ID、相似度分数等',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    INDEX idx_user_session (user_id, session_id),
    INDEX idx_created_at (created_at),
    INDEX idx_source (source),
    INDEX idx_is_helpful (is_helpful),
    INDEX idx_distilled (distilled),
    FULLTEXT INDEX ft_question (question, answer) WITH PARSER ngram COMMENT 'ngram全文检索，支持中文分词'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI对话记录表';
