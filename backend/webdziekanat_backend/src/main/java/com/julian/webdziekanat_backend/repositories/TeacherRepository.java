package com.julian.webdziekanat_backend.repositories;

import com.julian.webdziekanat_backend.model.Auth0;
import com.julian.webdziekanat_backend.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByAuth0(Auth0 auth0);
} 