package com.julian.webdziekanat_backend.repositories;

import com.julian.webdziekanat_backend.dto.auth0.Auth0DTO;
import com.julian.webdziekanat_backend.model.Auth0;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface Auth0Repository extends JpaRepository<Auth0, String> {

    @Query("""
            SELECT new com.julian.webdziekanat_backend.dto.auth0.Auth0DTO(a.auth0_id, a.role)
            FROM Auth0 a LEFT JOIN Person p ON a = p.auth0
            WHERE p.auth0 IS NULL""")
    List<Auth0DTO> findNotFilledUsers();
}
