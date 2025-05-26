package com.julian.webdziekanat_backend.security.permissions;

import com.julian.webdziekanat_backend.repositories.Auth0Repository;
import com.julian.webdziekanat_backend.repositories.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.io.Serializable;

@Component
@RequiredArgsConstructor
public class TeacherPermissionEvaluator implements PermissionEvaluator {

    private final Auth0Repository auth0Repository;
    private final TeacherRepository teacherRepository;

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        if (authentication == null || !(targetDomainObject instanceof Long teacherId)) {
            return false;
        }
        String auth0UserId = authentication.getName();
        return teacherRepository.findByAuth0(
                auth0Repository.findById(auth0UserId).orElse(null))
                .map(teacher -> teacher.getId().equals(teacherId))
                .orElse(false);
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        return false; // Not implemented
    }
}
