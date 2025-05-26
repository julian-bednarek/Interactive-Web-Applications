package com.julian.webdziekanat_backend.security.permissions;

import com.julian.webdziekanat_backend.model.Student;
import com.julian.webdziekanat_backend.repositories.Auth0Repository;
import com.julian.webdziekanat_backend.repositories.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class StudentPermissionEvaluator implements PermissionEvaluator {

    private final StudentRepository studentRepository;
    private final Auth0Repository auth0Repository;

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        if (authentication == null || !(targetDomainObject instanceof String requestedIndex)) {
            return false;
        }
        String auth0UserId = authentication.getName();
        Optional<Student> studentOptional = studentRepository.findByAuth0(
                auth0Repository.findById(auth0UserId).orElse(null));
        if (studentOptional.isEmpty()) {
            return false;
        }
        return studentOptional.map(student -> student.getIndexNumber().equals(requestedIndex)).orElse(false);
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        return false;
    }
}
