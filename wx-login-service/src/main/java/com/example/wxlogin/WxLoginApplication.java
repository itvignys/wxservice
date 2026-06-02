package com.example.wxlogin;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.example.wxlogin.mapper")
public class WxLoginApplication {

    public static void main(String[] args) {
        SpringApplication.run(WxLoginApplication.class, args);
    }

}
