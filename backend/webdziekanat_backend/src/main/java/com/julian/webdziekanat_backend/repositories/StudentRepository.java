package com.julian.webdziekanat_backend.repositories;

import com.julian.webdziekanat_backend.model.Auth0;
import com.julian.webdziekanat_backend.model.Student;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByIndexNumber(String indexNumber);
    @Query("""
        SELECT s.depositAccountNumber, s.withdrawalAccountNumber FROM Student s WHERE s.indexNumber = :indexNum""")
    List<String> getStudentsAccounts(@Param("indexNum") String indexNumber);

    @Transactional
    @Modifying
    @Query("""
        DELETE FROM Student s WHERE s.indexNumber = :index""")
    void deleteByIndex(@Param("index") String indexNumber);

    Optional<Student> findByAuth0(Auth0 auth0);
}