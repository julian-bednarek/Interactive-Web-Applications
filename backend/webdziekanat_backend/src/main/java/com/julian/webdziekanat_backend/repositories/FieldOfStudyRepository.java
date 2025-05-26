package com.julian.webdziekanat_backend.repositories;

import com.julian.webdziekanat_backend.model.FieldOfStudy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FieldOfStudyRepository extends JpaRepository<FieldOfStudy, Long> {
} 