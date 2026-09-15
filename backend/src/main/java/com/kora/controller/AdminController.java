package com.kora.controller;

import com.kora.dto.request.UpdateUserRoleRequest;
import com.kora.dto.response.AdminStatsResponse;
import com.kora.dto.response.AuditLogResponse;
import com.kora.dto.response.UserResponse;
import com.kora.service.AdminService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public AdminStatsResponse stats() {
        return adminService.getStats();
    }

    @GetMapping("/users")
    public Page<UserResponse> users(@RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "20") int size) {
        return adminService.listUsers(page, size);
    }

    @PutMapping("/users/{id}/suspend")
    public UserResponse suspend(@PathVariable Long id, Authentication auth) {
        return adminService.toggleSuspend(auth.getName(), id);
    }

    @PutMapping("/users/{id}/role")
    public UserResponse changeRole(@PathVariable Long id,
                                   @Valid @RequestBody UpdateUserRoleRequest req,
                                   Authentication auth) {
        return adminService.changeRole(auth.getName(), id, req);
    }

    @GetMapping("/audit-logs")
    public Page<AuditLogResponse> auditLogs(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        return adminService.listAuditLogs(page, size);
    }
}