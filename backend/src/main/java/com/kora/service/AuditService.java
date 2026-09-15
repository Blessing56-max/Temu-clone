package com.kora.service;

import com.kora.entity.AuditLog;
import com.kora.entity.User;
import com.kora.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void log(User actor, String action, String targetType, Long targetId, String metadata) {
        auditLogRepository.save(AuditLog.builder()
                .actor(actor)
                .actorEmail(actor != null ? actor.getEmail() : "system")
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .metadata(metadata)
                .build());
    }
}