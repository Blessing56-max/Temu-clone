package com.kora.service;

import com.kora.dto.response.NotificationResponse;
import com.kora.entity.Notification;
import com.kora.entity.User;
import com.kora.exception.ApiException;
import com.kora.repository.NotificationRepository;
import com.kora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void notify(User user, String type, String title, String message, String link) {
        notificationRepository.save(Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .link(link)
                .read(false)
                .build());
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> list(String email, int page, int size) {
        Long userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(
                userId, PageRequest.of(page, Math.min(size, 50)))
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public long unreadCount(String email) {
        Long userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public NotificationResponse markRead(String email, Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification not found"));
        if (!n.getUser().getEmail().equals(email)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your notification");
        }
        n.setRead(true);
        return toResponse(notificationRepository.save(n));
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getType(), n.getTitle(), n.getMessage(),
                n.getLink(), n.isRead(), n.getCreatedAt());
    }
}