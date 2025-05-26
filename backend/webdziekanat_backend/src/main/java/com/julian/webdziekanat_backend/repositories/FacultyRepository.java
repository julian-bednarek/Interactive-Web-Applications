package com.julian.webdziekanat_backend.repositories;

import com.julian.webdziekanat_backend.model.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
} 