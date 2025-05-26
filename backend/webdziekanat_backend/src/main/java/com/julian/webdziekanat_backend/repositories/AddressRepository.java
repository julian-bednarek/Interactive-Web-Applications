package com.julian.webdziekanat_backend.repositories;

import com.julian.webdziekanat_backend.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    @Query("SELECT a FROM Address a WHERE a.street = :street " +
            "AND a.houseNumber = :houseNumber " +
            "AND (:flatNumber IS NULL OR a.flatNumber = :flatNumber) " +
            "AND a.postalCode = :postalCode " +
            "AND a.city = :city " +
            "AND a.voivodeship = :voivodeship")
    Address findSpecificAddress(
            @Param("street") String street,
            @Param("houseNumber") String houseNumber,
            @Param("flatNumber") Integer flatNumber,
            @Param("postalCode") String postalCode,
            @Param("city") String city,
            @Param("voivodeship") String voivodeship
    );
}
