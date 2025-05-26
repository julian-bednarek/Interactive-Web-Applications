package com.julian.webdziekanat_backend.repositories;

import com.julian.webdziekanat_backend.model.Payment;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByFeeId(Long id);

    Optional<Payment> findByStudentIdAndFeeId(Long id, Long id1);

    List<Payment> findByStudentId(Long id);

    @Modifying
    @Transactional
    @Query(
    """
    DELETE FROM Payment p WHERE p.student.indexNumber = :index
    """)
    void deleteByStudentIndex(@Param("index") String index);
}