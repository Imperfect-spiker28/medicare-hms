package com.hospital.service;

import com.hospital.entity.AuditLog;
import com.hospital.entity.User;
import com.hospital.repository.AuditLogRepository;
import com.hospital.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void log(UUID userId, String action, String entityType, UUID entityId, String detail) {
        try {
            User user = null;
            if (userId != null) {
                user = userRepository.findById(userId).orElse(null);
            }

            AuditLog auditLog = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .detail(detail)
                    .build();

            auditLogRepository.save(auditLog);
        } catch (Exception ex) {
            log.error("Failed to persist audit log: action={}, entityType={}, entityId={}", action, entityType, entityId, ex);
        }
    }
}
