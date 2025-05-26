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
public class Subject {

    @Id
    @Column(unique = true, nullable = false)
    private String code;
    @Column(nullable = false)
    private String name;
    @ManyToOne
    private Teacher teacher;
    @Column(nullable = false)
    private int ECTS;
    @OneToMany(mappedBy = "subject")
    private List<StudentToSubject> studentToSubjects;
}