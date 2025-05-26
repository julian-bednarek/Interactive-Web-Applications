package com.julian.webdziekanat_backend.controllers;

import com.julian.webdziekanat_backend.dto.FacultyDTO;
import com.julian.webdziekanat_backend.repositories.FacultyRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;


@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/public")
@RestController
public class PublicRESTController {
    private final FacultyRepository facultyRepository;

    public PublicRESTController(FacultyRepository facultyRepository) {
        this.facultyRepository = facultyRepository;
    }

    @GetMapping("/faculty/{id}")
    public ResponseEntity<FacultyDTO> getFacultyById(@PathVariable Long id) {
        FacultyDTO faculty = facultyRepository.findById(id)
                .map(facultyEntity -> new FacultyDTO(facultyEntity.getId(), facultyEntity.getName()))
                .orElse(null);
        return ResponseEntity.ok(faculty);
    }

    @GetMapping("/faculty")
    public ResponseEntity<List<FacultyDTO>> getAllFaculties() {
        List<FacultyDTO> faculties = facultyRepository.findAll()
                .stream()
                .map(facultyEntity -> new FacultyDTO(facultyEntity.getId(), facultyEntity.getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(faculties);
    }
}
