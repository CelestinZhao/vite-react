package com.example.aichat.dto;

/**
 * 模型信息（GET /api/models 返回）
 */
public record ModelInfo(
        String id,
        String name,
        String provider,
        String description
) {}
