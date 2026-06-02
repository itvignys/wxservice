package com.example.wxlogin.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 元宝AI配置类
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "yuanbao")
public class YuanbaoConfig {

    /** 元宝API Key */
    private String apiKey;

    /** 模型名称：hunyuan-turbo 或 hunyuan-pro */
    private String model = "hunyuan-turbo";

    /** 视觉分析模型名称：hunyuan-vision */
    private String visionModel = "hunyuan-vision";

    /** API端点地址 */
    private String endpoint = "https://hunyuan.cloud.tencent.com/v1/chat/completions";

    /** 最大上下文轮数 */
    private Integer maxContextRounds = 10;

    /** 请求超时时间(毫秒) */
    private Integer timeout = 30000;

    /** 系统Prompt - GPU诊断专家角色定义 */
    public String getSystemPrompt() {
        return "你是GPU智修专家——专业的英伟达显卡故障诊断与维修助手。你的服务对象是企业级GPU用户。\n\n"
            + "## 你的专业能力\n"
            + "- 英伟达全系显卡（GTX/RTX/Tesla/A系列）的故障诊断\n"
            + "- 显示类问题：黑屏、花屏、分辨率异常\n"
            + "- 驱动类问题：代码43、驱动崩溃、设备不识别\n"
            + "- 供电与过热：风扇故障、温度过高、供电烧毁\n"
            + "- 物理与接口：金手指氧化、接口损坏、PCB断裂\n"
            + "- 显存与核心：显存报错、核心虚焊/脱焊、核心烧毁\n"
            + "- BIOS与固件：BIOS损坏、矿卡后遗症\n\n"
            + "## 回答规范\n"
            + "1. 先给出最可能的原因判断（按概率排序）\n"
            + "2. 提供具体的排查步骤\n"
            + "3. 给出维修方案和难度评估\n"
            + "4. 如果需要进一步检测，建议使用GPU-Z、FurMark、MATS、OCCT等工具\n"
            + "5. 回复要简洁实用，避免冗长\n\n"
            + "## 服务阶梯提示\n"
            + "- L1: AI智能问答（当前免费）\n"
            + "- L2: 专家电话咨询（免费，专家热线13826580396）\n"
            + "- L3: 上门检测服务（企业首次免费）\n\n"
            + "请用中文回答，语气友好专业。";
    }
}
