package com.webpurchase.modules.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
public class SseNotificationService {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter createConnection() {
        SseEmitter emitter = new SseEmitter(180_000L); // 3-minute timeout

        emitter.onCompletion(() -> {
            log.info("SSE emitter completed");
            emitters.remove(emitter);
        });

        emitter.onTimeout(() -> {
            log.info("SSE emitter timed out");
            emitters.remove(emitter);
        });

        emitter.onError(ex -> {
            log.warn("SSE emitter error: {}", ex.getMessage());
            emitters.remove(emitter);
        });

        emitters.add(emitter);

        try {
            emitter.send(SseEmitter.event()
                    .name("INIT")
                    .data("Connected to WebPurchase Realtime Notification Stream"));
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    public void broadcast(String eventName, Object data) {
        log.info("Broadcasting SSE event: {} to {} active clients", eventName, emitters.size());
        List<SseEmitter> deadEmitters = new java.util.ArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }

        emitters.removeAll(deadEmitters);
    }

    @Scheduled(fixedRate = 25000)
    public void sendHeartbeat() {
        broadcast("HEARTBEAT", System.currentTimeMillis());
    }
}
