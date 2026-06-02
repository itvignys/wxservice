package com.example.wxlogin.controller;

import com.example.wxlogin.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;

/**
 * 文件上传控制器
 * 支持图片和语音文件上传，带安全校验
 */
@Slf4j
@RestController
@RequestMapping("/api")
public class UploadController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    /** 最大文件大小：10MB */
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    /** 允许的文件扩展名白名单 */
    private static final List<String> ALLOWED_EXTS = Arrays.asList(
        ".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp3", ".wav", ".m4a"
    );

    /** 危险扩展名黑名单 */
    private static final List<String> DANGEROUS_EXTS = Arrays.asList(
        ".exe", ".bat", ".cmd", ".sh", ".jsp", ".php", ".asp", ".aspx",
        ".jar", ".war", ".class", ".py", ".rb", ".pl", ".cgi"
    );

    /**
     * 通用文件上传
     * POST /api/upload
     *
     * 请求: multipart/form-data, fieldName=file
     * 响应: { "url": "/uploads/xxx.jpg", "fileName": "xxx.jpg" }
     */
    @PostMapping("/upload")
    public ApiResponse<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ApiResponse.fail("文件不能为空");
        }

        // 1. 文件大小校验
        if (file.getSize() > MAX_FILE_SIZE) {
            log.warn("上传文件过大: {}MB", file.getSize() / (1024 * 1024));
            return ApiResponse.fail("文件大小不能超过10MB");
        }

        // 2. 文件名和扩展名校验
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isEmpty()) {
            return ApiResponse.fail("文件名不能为空");
        }

        // 去除路径穿越风险
        originalName = Paths.get(originalName).getFileName().toString();

        String ext = "";
        if (originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf(".")).toLowerCase(Locale.ROOT);
        }

        // 黑名单校验
        if (DANGEROUS_EXTS.contains(ext)) {
            log.warn("上传危险文件被拦截: {}, ext={}", originalName, ext);
            return ApiResponse.fail("不支持的文件类型");
        }

        // 白名单校验（仅允许图片和音频）
        if (!ALLOWED_EXTS.contains(ext)) {
            log.warn("上传文件类型不在白名单: {}, ext={}", originalName, ext);
            return ApiResponse.fail("仅支持图片（jpg/png/gif/webp）和音频（mp3/wav/m4a）文件");
        }

        try {
            String fileName = System.currentTimeMillis() + "_" + (int) (Math.random() * 10000) + ext;

            Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(dir)) {
                Files.createDirectories(dir);
            }
            Path target = dir.resolve(fileName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            String url = "/uploads/" + fileName;
            Map<String, String> data = new HashMap<>();
            data.put("url", url);
            data.put("fileName", fileName);

            log.info("文件上传成功: {}, 大小: {}KB, 类型: {}", fileName, file.getSize() / 1024, ext);
            return ApiResponse.success("上传成功", data);
        } catch (Exception e) {
            log.error("文件上传失败", e);
            return ApiResponse.fail("上传失败: " + e.getMessage());
        }
    }
}
