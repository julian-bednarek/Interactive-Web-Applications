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
public class Teacher extends Person {
    @Column
    private String academicTitle;
    
    @OneToMany(mappedBy = "teacher")
    private List<Subject> subjects;
}