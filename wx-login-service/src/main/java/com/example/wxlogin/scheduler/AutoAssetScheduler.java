package com.example.wxlogin.scheduler;

import com.example.wxlogin.service.KnowledgeDistillService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 数据资产自动沉淀定时任务
 * 每周一凌晨2点执行：扫描优质对话并自动知识提纯
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AutoAssetScheduler {

    private final KnowledgeDistillService knowledgeDistillService;

    /**
     * 每周一凌晨 02:00 执行
     * cron: 秒 分 时 日 月 周
     */
    @Scheduled(cron = "0 0 2 * * 1")
    public void weeklyDistill() {
        log.info("===== 开始执行每周知识提纯任务 =====");
        try {
            var list = knowledgeDistillService.batchDistill(50);
            log.info("===== 知识提纯任务完成，生成{}条草稿 =====", list.size());
        } catch (Exception e) {
            log.error("每周知识提纯任务失败", e);
        }
    }
}
