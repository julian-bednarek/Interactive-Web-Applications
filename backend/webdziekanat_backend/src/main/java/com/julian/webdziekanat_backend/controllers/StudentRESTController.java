package com.julian.webdziekanat_backend.controllers;

import com.julian.webdziekanat_backend.dto.*;
import com.julian.webdziekanat_backend.services.interfaces.StudentService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasAnyAuthority('read:everything', 'write:everything', 'read:student', 'write:student')")
public class StudentRESTController {
    private final StudentService studentService;

    public StudentRESTController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/grades/{index}&{semester}")
    @PreAuthorize("hasPermission(#index, 'read:student') or hasAuthority('read:everything')")
    public ResponseEntity<ReportCardDTO> getReportCard(@PathVariable("index") String index, @PathVariable("semester") int semester) {
        try {
            return new ResponseEntity<>(studentService.getStudentSubjects(index, semester), HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/bank-accounts/{index}")
    @PreAuthorize("hasPermission(#index, 'read:student') or hasAuthority('read:everything')")
    public ResponseEntity<StudentBankAccountsDTO> getStudentBankAccounts(@PathVariable("index") String index) {
        try {
            return new ResponseEntity<>(studentService.getStudentBankAccounts(index), HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/bank-accounts/{index}")
    @PreAuthorize("hasPermission(#index, 'write:student') or hasAuthority('write:everything')")
    public ResponseEntity<Void> updateStudentBankAccounts(@PathVariable("index") String index, @RequestBody StudentBankAccountsDTO studentBankAccountsDTO) {
        try {
            studentService.updateStudentBankAccounts(index, studentBankAccountsDTO);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/personal-data/{index}")
    @PreAuthorize("hasPermission(#index, 'read:student') or hasAuthority('read:everything')")
    public ResponseEntity<StudentPersonalDTO> getStudentPersonalData(@PathVariable("index") String index) {
        try {
            return new ResponseEntity<>(studentService.getStudentPersonalData(index), HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/personal-data/{index}")
    @PreAuthorize("hasPermission(#index, 'write:student') or hasAuthority('write:everything')")
    public ResponseEntity<Void> updateStudentPersonalData(@PathVariable("index") String index, @RequestBody StudentPersonalDTO studentPersonalDTO) {
        try {
            studentService.updateStudentPersonalData(index, studentPersonalDTO);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/field-of-study/{index}")
    @PreAuthorize("hasPermission(#index, 'read:student') or hasAuthority('read:everything')")
    public ResponseEntity<FieldOfStudyReadDTO> getStudentFieldOfStudy(@PathVariable("index") String index) {
        try {
            return new ResponseEntity<>(studentService.getStudentFieldOfStudy(index), HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/general-study/{index}")
    @PreAuthorize("hasPermission(#index, 'read:student') or hasAuthority('read:everything')")
    public ResponseEntity<GeneralStudyDTO> getStudentGeneralStudy(@PathVariable("index") String index) {
        try {
            return new ResponseEntity<>(studentService.getStudentGeneralStudy(index), HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/payments/{index}&{semester}")
    @PreAuthorize("hasPermission(#index, 'read:student') or hasAuthority('read:everything')")
    public ResponseEntity<PaymentsDTO> getStudentFees(@PathVariable("index") String index, @PathVariable("semester") int semester) {
        try {
            return new ResponseEntity<>(studentService.getStudentFees(index, semester), HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/obtain-index/{auth}")
    @PreAuthorize("hasAnyAuthority('read:everything', 'read:student')")
    public ResponseEntity<String> getStudentIndex(@PathVariable("auth") String auth0ID) {
        try {
            System.out.println(auth0ID);
            return new ResponseEntity<>(studentService.getStudentIndex(auth0ID), HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
