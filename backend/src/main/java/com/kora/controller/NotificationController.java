package com.kora.controller;

import com.kora.dto.response.NotificationResponse;
import com.kora.service.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public Page<NotificationResponse> list(Authentication auth,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size) {
        return notificationService.list(auth.getName(), page, size);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unread(Authentication auth) {
        return Map.of("unread", notificationService.unreadCount(auth.getName()));
    }

    @PutMapping("/{id}/read")
    public NotificationResponse markRead(@PathVariable Long id, Authentication auth) {
        return notificationService.markRead(auth.getName(), id);
    }
}