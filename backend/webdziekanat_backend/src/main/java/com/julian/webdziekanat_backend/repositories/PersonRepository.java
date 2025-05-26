package com.julian.webdziekanat_backend.repositories;

import com.julian.webdziekanat_backend.model.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {
    @Query("""
    SELECT p FROM Person p WHERE p.address.id = :addressId
    """)
    List<Person> findByAddressId(@Param("addressId") Integer addressId);
} 