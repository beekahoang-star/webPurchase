package com.webpurchase.modules.notification.controller;

import com.webpurchase.modules.notification.service.SseNotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Realtime Notifications", description = "Server-Sent Events (SSE) stream for live counter badges and alerts")
public class NotificationController {

    private final SseNotificationService sseNotificationService;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Subscribe to realtime SSE stream (Live counter badges, alerts)")
    public SseEmitter subscribeStream() {
        return sseNotificationService.createConnection();
    }
}
