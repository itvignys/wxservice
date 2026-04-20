package com.example.wxlogin.util;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 数据库初始化工具 - 自动建表
 * 通过 mvn exec:java -Dexec.mainClass="com.example.wxlogin.util.DatabaseInitializer" 运行
 */
public class DatabaseInitializer {

    private static final String URL = "jdbc:mysql://110.42.209.219:3306/gpu?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true";
    private static final String USERNAME = "root";
    private static final String PASSWORD = "mysql_wjQhXB";

    public static void main(String[] args) {
        System.out.println("============================================");
        System.out.println("  维修工单系统 - 数据库初始化");
        System.out.println("============================================");
        System.out.println();

        try {
            // 加载MySQL驱动
            Class.forName("com.mysql.cj.jdbc.Driver");
            System.out.println("[OK] MySQL驱动加载成功");

            // 读取SQL文件
            InputStream is = DatabaseInitializer.class.getClassLoader()
                    .getResourceAsStream("sql/repair_order_tables.sql");
            if (is == null) {
                // 尝试从文件系统读取
                java.io.File file = new java.io.File("src/main/resources/sql/repair_order_tables.sql");
                if (file.exists()) {
                    is = new java.io.FileInputStream(file);
                } else {
                    System.err.println("[ERROR] 找不到SQL文件: sql/repair_order_tables.sql");
                    return;
                }
            }

            String sql;
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
                sql = reader.lines().collect(Collectors.joining("\n"));
            }
            System.out.println("[OK] SQL文件读取成功");

            // 分割SQL语句（按分号分割，但忽略注释）
            String[] statements = splitSql(sql);

            // 连接数据库并执行
            System.out.println("[..] 正在连接数据库: " + URL);
            try (Connection conn = DriverManager.getConnection(URL, USERNAME, PASSWORD)) {
                System.out.println("[OK] 数据库连接成功");
                System.out.println();

                try (Statement stmt = conn.createStatement()) {
                    int success = 0;
                    int skipped = 0;
                    for (String s : statements) {
                        s = s.trim();
                        if (s.isEmpty() || s.startsWith("--")) {
                            continue;
                        }
                        try {
                            stmt.execute(s);
                            // 简要显示执行的语句
                            String preview = s.length() > 80 ? s.substring(0, 80) + "..." : s;
                            System.out.println("[OK] " + preview);
                            success++;
                        } catch (Exception e) {
                            String preview = s.length() > 60 ? s.substring(0, 60) + "..." : s;
                            System.out.println("[SKIP] " + preview);
                            System.out.println("       原因: " + e.getMessage());
                            skipped++;
                        }
                    }
                    System.out.println();
                    System.out.println("============================================");
                    System.out.println("  初始化完成！成功: " + success + ", 跳过: " + skipped);
                    System.out.println("============================================");
                }
            }
        } catch (ClassNotFoundException e) {
            System.err.println("[ERROR] MySQL驱动未找到，请确保pom.xml中有mysql-connector-java依赖");
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("[ERROR] 初始化失败");
            e.printStackTrace();
        }
    }

    /**
     * 分割SQL语句
     */
    private static String[] splitSql(String sql) {
        List<String> statements = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inComment = false;

        for (String line : sql.split("\n")) {
            String trimmed = line.trim();

            // 跳过空行和注释
            if (trimmed.isEmpty() || trimmed.startsWith("--")) {
                continue;
            }

            if (inComment) {
                if (trimmed.endsWith("*/")) {
                    inComment = false;
                }
                continue;
            }
            if (trimmed.startsWith("/*")) {
                if (!trimmed.endsWith("*/")) {
                    inComment = true;
                }
                continue;
            }

            current.append(line).append("\n");

            // 简单的语句分割：以分号结尾
            if (trimmed.endsWith(";")) {
                String stmt = current.toString().trim();
                if (!stmt.isEmpty()) {
                    // 去掉末尾分号
                    statements.add(stmt.substring(0, stmt.length() - 1));
                }
                current = new StringBuilder();
            }
        }

        // 处理最后一条没有分号的语句
        String last = current.toString().trim();
        if (!last.isEmpty()) {
            statements.add(last);
        }

        return statements.toArray(new String[0]);
    }
}
