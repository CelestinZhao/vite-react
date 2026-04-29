package com.example.aichat.dto;

/**
 * 统一 API 响应体：{ code, message, data }
 * <p>与 Node 版 `ctx.body = { code: 0, message: 'ok', data: ... }` 保持完全一致</p>
 */
public record ApiResponse<T>(int code, String message, T data) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(0, "ok", data);
    }

    public static <T> ApiResponse<T> error(int code, String message) {
        return new ApiResponse<>(code, message, null);
    }
}
