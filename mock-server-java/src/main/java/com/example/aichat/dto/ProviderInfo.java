package com.example.aichat.dto;

/**
 * Provider 可用性信息（GET /api/providers 返回）
 */
public record ProviderInfo(
        String name,
        boolean available,
        String description
) {}
