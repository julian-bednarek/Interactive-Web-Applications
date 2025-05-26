package com.julian.webdziekanat_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "addresses")
public class Address {
    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private String street;
    @Column(nullable = false)
    private String city;
    @Column(nullable = false)
    private String voivodeship;
    @Column(nullable = false)
    private String postalCode;
    @Column(nullable = false)
    private String houseNumber;
    @Column
    private Integer flatNumber;
    @Column(nullable = false)
    private boolean confirmed;

    @OneToMany(mappedBy = "address", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    List<Person> residents;
}
