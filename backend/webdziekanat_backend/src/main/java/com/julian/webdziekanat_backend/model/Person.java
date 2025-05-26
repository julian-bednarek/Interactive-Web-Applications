package com.julian.webdziekanat_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "people")
public class Person {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, cascade = CascadeType.ALL)
    @JoinColumn(name = "auth0_id", referencedColumnName = "auth0_id", nullable = false)
    private Auth0 auth0;
    @Column(nullable = false)
    private String firstName;
    @Column(nullable = false)
    private String lastName;
    @Column
    private String fatherName;
    @Column(nullable = false, unique = true)
    private String PESEL;
    @Column(nullable = false)
    private String phoneNumber;
    @Column
    private String placeOfBirth;

    @Column
    private String eDeliveryEmail;

    @ManyToOne
    private Address address;

    @ManyToOne
    private Faculty faculty;
}
