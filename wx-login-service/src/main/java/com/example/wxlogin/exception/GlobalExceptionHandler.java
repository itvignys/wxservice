package com.example.wxlogin.exception;

import com.example.wxlogin.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.exceptions.PersistenceException;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.sql.SQLException;
import java.util.stream.Collectors;

/**
 * 全局异常处理器
 * 统一捕获所有异常，返回JSON格式的错误信息
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ==================== 通用业务异常 ====================

    /**
     * 处理参数校验异常（@Valid 校验失败）
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ApiResponse<Void> handleValidException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        log.warn("参数校验失败: {}", message);
        return ApiResponse.fail("参数校验失败: " + message);
    }

    /**
     * 处理绑定异常
     */
    @ExceptionHandler(BindException.class)
    public ApiResponse<Void> handleBindException(BindException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        log.warn("参数绑定失败: {}", message);
        return ApiResponse.fail("参数绑定失败: " + message);
    }

    /**
     * 处理请求体解析异常（JSON格式错误、缺少请求体等）
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleMessageNotReadable(HttpMessageNotReadableException e) {
        log.warn("请求体解析失败: {}", e.getMessage());
        return ApiResponse.fail("请求体格式错误，请检查JSON格式");
    }

    /**
     * 处理缺少请求参数异常
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleMissingParam(MissingServletRequestParameterException e) {
        log.warn("缺少请求参数: {}", e.getParameterName());
        return ApiResponse.fail("缺少请求参数: " + e.getParameterName());
    }

    // ==================== HTTP 相关异常 ====================

    /**
     * 处理404 - 接口不存在
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponse<Void> handleNotFound(NoHandlerFoundException e) {
        log.warn("接口不存在: {} {}", e.getHttpMethod(), e.getRequestURL());
        return ApiResponse.fail("接口不存在: " + e.getRequestURL());
    }

    /**
     * 处理405 - 请求方法不支持
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    @ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)
    public ApiResponse<Void> handleMethodNotSupported(HttpRequestMethodNotSupportedException e) {
        log.warn("请求方法不支持: {}", e.getMethod());
        return ApiResponse.fail("不支持的请求方法: " + e.getMethod());
    }

    /**
     * 处理415 - 媒体类型不支持
     */
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    @ResponseStatus(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
    public ApiResponse<Void> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException e) {
        log.warn("媒体类型不支持: {}", e.getContentType());
        return ApiResponse.fail("不支持的Content-Type: " + e.getContentType());
    }

    // ==================== 数据库相关异常 ====================

    /**
     * 处理 MyBatis/MySQL 数据库异常
     */
    @ExceptionHandler(PersistenceException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handlePersistenceException(PersistenceException e) {
        log.error("数据库操作异常", e);
        String message = extractSqlMessage(e);
        return ApiResponse.fail("数据库操作失败: " + message);
    }

    /**
     * 处理 Spring JDBC 数据访问异常
     */
    @ExceptionHandler(DataAccessException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleDataAccessException(DataAccessException e) {
        log.error("数据访问异常", e);
        String message = extractSqlMessage(e);
        return ApiResponse.fail("数据访问失败: " + message);
    }

    /**
     * 处理 SQL 语法异常
     */
    @ExceptionHandler(SQLException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleSqlException(SQLException e) {
        log.error("SQL执行异常: {}", e.getMessage());
        return ApiResponse.fail("SQL执行失败，请检查数据格式");
    }

    // ==================== 业务异常 ====================

    /**
     * 处理运行时异常（业务逻辑抛出的RuntimeException）
     */
    @ExceptionHandler(RuntimeException.class)
    public ApiResponse<Void> handleRuntimeException(RuntimeException e) {
        log.error("运行时异常: {}", e.getMessage(), e);
        String message = e.getMessage();
        // 避免暴露内部实现细节
        if (message == null || message.contains("Exception") || message.contains("Error")) {
            return ApiResponse.fail("操作失败，请稍后重试");
        }
        return ApiResponse.fail(message);
    }

    /**
     * 处理所有未捕获的异常（兜底）
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return ApiResponse.fail("系统异常，请稍后重试");
    }

    // ==================== 私有工具方法 ====================

    /**
     * 从异常中提取简化的SQL错误信息
     */
    private String extractSqlMessage(Exception e) {
        String msg = e.getMessage();
        if (msg == null) return "未知数据库错误";
        // 提取关键错误信息，避免暴露过多细节
        if (msg.contains("doesn't exist")) return "表或字段不存在";
        if (msg.contains("Duplicate entry")) return "数据重复，请检查唯一性约束";
        if (msg.contains("foreign key")) return "关联数据不存在或已被删除";
        if (msg.contains("Data too long")) return "数据过长，请缩短输入";
        if (msg.contains("Incorrect")) return "数据类型错误";
        // 截取前100字符
        return msg.length() > 100 ? msg.substring(0, 100) : msg;
    }

}
