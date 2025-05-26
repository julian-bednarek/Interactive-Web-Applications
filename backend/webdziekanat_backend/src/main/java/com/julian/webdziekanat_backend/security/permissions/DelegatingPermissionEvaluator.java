package com.julian.webdziekanat_backend.security.permissions;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.io.Serializable;

@Component
@RequiredArgsConstructor
public class DelegatingPermissionEvaluator implements PermissionEvaluator {

    private final TeacherPermissionEvaluator teacherPermissionEvaluator;
    private final StudentPermissionEvaluator studentPermissionEvaluator;

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        if (permission instanceof String permString) {
            if (permString.contains(":teacher")) {
                return teacherPermissionEvaluator.hasPermission(authentication, targetDomainObject, permission);
            } else if (permString.contains(":student")) {
                return studentPermissionEvaluator.hasPermission(authentication, targetDomainObject, permission);
            }
        }
        return false;
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        if ("Teacher".equalsIgnoreCase(targetType) || "read:teacher".equals(permission)) {
            if (targetId instanceof Long teacherId) {
                return teacherPermissionEvaluator.hasPermission(authentication, teacherId, permission);
            }
        } else if ("Student".equalsIgnoreCase(targetType) || "some:student:permission".equals(permission)) {
            if (targetId instanceof Long studentId) {
                return studentPermissionEvaluator.hasPermission(authentication, studentId, permission);
            }
        }
        return false;
    }
}