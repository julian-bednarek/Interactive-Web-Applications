package com.julian.webdziekanat_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class FieldOfStudy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String degree;
    
    @Column(nullable = false)
    private String formOfStudy;
    
    @Column(nullable = false)
    private int lengthOfStudy;
    
    @OneToMany(mappedBy = "fieldOfStudy")
    private List<Student> students;

    @ManyToOne
    private Faculty faculty;
}
