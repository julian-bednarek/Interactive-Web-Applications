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
public class Faculty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @OneToMany(mappedBy = "faculty")
    private List<Person> people;
    
    @OneToMany(mappedBy = "faculty")
    private List<Fee> fees;

    @OneToMany
    private List<FieldOfStudy> fieldsOfStudy;
}
