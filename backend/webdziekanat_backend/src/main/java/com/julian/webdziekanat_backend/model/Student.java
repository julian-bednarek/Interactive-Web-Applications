package com.julian.webdziekanat_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@PrimaryKeyJoinColumn(name = "id")
public class Student extends Person {

    @Column(nullable = false, unique = true)
    private String indexNumber;
    @Column(nullable = false)
    private int currentSemester;
    @Column(nullable = false)
    private String depositAccountNumber;
    @Column
    private String withdrawalAccountNumber;
    @Column
    private int ECTSpointsToBeCollected;
    @Column
    private int ECTSpointsCollected;

    @ManyToOne
    private FieldOfStudy fieldOfStudy;
    
    @OneToMany(mappedBy = "student")
    private List<StudentToSubject> studentToSubjects;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Payment> payments;
}