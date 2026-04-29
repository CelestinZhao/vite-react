package com.example.aichat.controller;

import com.example.aichat.dto.ApiResponse;
import com.example.aichat.dto.ConversationVO;
import com.example.aichat.dto.MessageVO;
import com.example.aichat.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import reactor.core.scheduler.Schedulers;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * 会话管理接口（对应 Node 版 routes/conversations.js）
 * <p>响应格式 { code, message, data } 与 Node 版完全一致</p>
 */
@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService convService;

    /** GET /api/conversations */
    @GetMapping
    public Mono<ApiResponse<List<ConversationVO>>> list() {
        return Mono.fromCallable(convService::listConversations)
                .subscribeOn(Schedulers.boundedElastic())
                .map(ApiResponse::ok);
    }

    /** POST /api/conversations */
    @PostMapping
    public Mono<ApiResponse<ConversationVO>> create(@RequestBody(required = false) Map<String, String> body) {
        String title = body != null ? body.get("title") : null;
        String model = body != null ? body.get("model") : null;
        String systemPrompt = body != null ? body.get("systemPrompt") : null;
        return Mono.fromCallable(() -> convService.createConversation(title, model, systemPrompt))
                .subscribeOn(Schedulers.boundedElastic())
                .map(ApiResponse::ok);
    }

    /** GET /api/conversations/:id/messages */
    @GetMapping("/{id}/messages")
    public Mono<ResponseEntity<ApiResponse<?>>> messages(@PathVariable String id) {
        return Mono.fromCallable(() -> convService.listMessages(id))
                .subscribeOn(Schedulers.boundedElastic())
                .map(opt -> opt
                        .<ResponseEntity<ApiResponse<?>>>map(msgs -> ResponseEntity.ok(
                                ApiResponse.ok(Map.of("id", id, "messages", msgs))
                        ))
                        .orElseGet(() -> ResponseEntity.status(404)
                                .body(ApiResponse.error(404, "会话不存在")))
                );
    }

    /** PATCH /api/conversations/:id */
    @PatchMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse<?>>> update(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body) {
        String title = body != null ? body.get("title") : null;
        return Mono.fromCallable(() -> convService.updateConversation(id, title))
                .subscribeOn(Schedulers.boundedElastic())
                .map(opt -> opt
                        .<ResponseEntity<ApiResponse<?>>>map(vo -> ResponseEntity.ok(ApiResponse.ok(vo)))
                        .orElseGet(() -> ResponseEntity.status(404)
                                .body(ApiResponse.error(404, "会话不存在")))
                );
    }

    /** DELETE /api/conversations/:id */
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse<?>>> delete(@PathVariable String id) {
        return Mono.fromCallable(() -> convService.deleteConversation(id))
                .subscribeOn(Schedulers.boundedElastic())
                .map(ok -> ok
                        ? ResponseEntity.ok(ApiResponse.ok(null))
                        : ResponseEntity.status(404).<ApiResponse<?>>body(ApiResponse.error(404, "会话不存在"))
                );
    }
}
