package com.julian.webdziekanat_backend.controllers;

import com.julian.webdziekanat_backend.dto.*;
import com.julian.webdziekanat_backend.dto.auth0.Auth0DTO;
import com.julian.webdziekanat_backend.exceptions.IllegalDeletionAttemptException;
import com.julian.webdziekanat_backend.services.interfaces.AdminService;
import com.julian.webdziekanat_backend.services.interfaces.Auth0Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('read:everything', 'write:everything')")
public class AdminRESTController {
    private final Auth0Service auth0Service;
    private final AdminService adminService;

    @PostMapping("/sync-users")
    public ResponseEntity<Void> syncUsers() {
        auth0Service.syncUsers();
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/fill-teacher/{id}")
    public ResponseEntity<Void> fillTeacher(@PathVariable("id") String id, @RequestBody TeacherWriteDTO teacher) {
        adminService.addTeacher(teacher);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/fill-student/{id}")
    public ResponseEntity<Void> fillStudent(@PathVariable("id") String id, @RequestBody StudentWriteDTO student) {
        adminService.addStudent(student);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/add-subject/")
    public ResponseEntity<Void> addSubject(@RequestBody SubjectWriteDTO subject) {
        adminService.addSubject(subject);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/add-fee/")
    public ResponseEntity<Void> addFee(@RequestBody FeeWriteDTO fee) {
        adminService.addFee(fee);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/assign-student-to-subject/{index}&{subjectCode}&{semester}")
    public ResponseEntity<Void> assignStudentToSubject(@PathVariable("index") String index, @PathVariable("subjectCode") String subjectCode, @PathVariable("semester") int semester) {
        adminService.assignStudentToSubject(index, subjectCode, semester);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/delete-student/{index}")
    public ResponseEntity<Void> deleteStudent(@PathVariable("index") String index) {
        adminService.deleteStudent(index);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @DeleteMapping("/delete-teacher/{id}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable("id") Long id) {
        try {
            adminService.deleteTeacher(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (IllegalDeletionAttemptException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/delete-fee/{id}")
    public ResponseEntity<Void> deleteFee(@PathVariable("id") Long id) {
        try {
            adminService.deleteFee(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (IllegalDeletionAttemptException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/delete-subject/{subjectCode}")
    public ResponseEntity<Void> deleteSubject(@PathVariable("subjectCode") String subjectCode) {
        try {
            adminService.deleteSubject(subjectCode);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (IllegalDeletionAttemptException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/remove-student-from-subject/{index}&{subjectCode}&{semester}")
    public ResponseEntity<Void> removeStudentFromSubject(@PathVariable("index") String index, @PathVariable("subjectCode") String subjectCode, @PathVariable("semester") int semester) {
        adminService.removeStudentFromSubject(index, subjectCode, semester);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PutMapping("/update-subject/{code}")
    public ResponseEntity<Void> updateSubject(@PathVariable("code") String code, @RequestBody SubjectWriteDTO subject) {
        adminService.updateSubject(code, subject);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @PutMapping("/update-fee/{id}")
    public ResponseEntity<Void> updateFee(@PathVariable("id") Long id, @RequestBody FeeWriteDTO fee) {
        adminService.updateFee(id, fee);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @PutMapping("/change-subject-teacher/{subjectId}&{teacherId}")
    public ResponseEntity<Void> changeSubjectTeacher(@PathVariable("subjectId") String subjectId, @PathVariable("teacherId") Long teacherId) {
        adminService.changeSubjectTeacher(subjectId, teacherId);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @GetMapping("/get-not-filled-users")
    public ResponseEntity<List<Auth0DTO>> getNotFilledUsers() {
        List<Auth0DTO> notFilledUsers = adminService.getNotFilledUsers();
        return ResponseEntity.ok(notFilledUsers);
    }

    @GetMapping("/get-subjects")
    public ResponseEntity<List<SubjectWriteDTO>> getSubjects() {
        List<SubjectWriteDTO> subjects = adminService.getSubjects();
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/get-subjects/{index}")
    public ResponseEntity<List<SubjectWriteDTO>> getSubjectsByIndex(@PathVariable("index") String index) {
        List<SubjectWriteDTO> subjects = adminService.getSubjectsByStudentIndex(index);
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/get-fees")
    public ResponseEntity<List<FeeWriteDTO>> getFees() {
        List<FeeWriteDTO> fees = adminService.getFees();
        return ResponseEntity.ok(fees);
    }

    @GetMapping("/get-teachers")
    public ResponseEntity<List<TeacherWriteDTO>> getTeachers() {
        List<TeacherWriteDTO> teachers = adminService.getTeachers();
        return ResponseEntity.ok(teachers);
    }

    @GetMapping("/get-students")
    public ResponseEntity<List<StudentWriteDTO>> getStudents() {
        List<StudentWriteDTO> students = adminService.getStudents();
        return ResponseEntity.ok(students);
    }

    @GetMapping("/fields-of-study")
    public ResponseEntity<List<FieldOfStudyReadDTO>> getFieldsOfStudy() {
        List<FieldOfStudyReadDTO> fieldsOfStudy = adminService.getFieldsOfStudy();
        return ResponseEntity.ok(fieldsOfStudy);
    }

    @PostMapping("/fields-of-study")
    public ResponseEntity<Void> addFieldOfStudy(@RequestBody FieldOfStudyWriteDTO fieldOfStudy) {
        adminService.addFieldOfStudy(fieldOfStudy);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/fields-of-study/{id}")
    public ResponseEntity<Void> updateFieldOfStudy(@PathVariable("id") Long id, @RequestBody FieldOfStudyWriteDTO fieldOfStudy) {
        adminService.updateFieldOfStudy(id, fieldOfStudy);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @DeleteMapping("/fields-of-study/{id}")
    public ResponseEntity<Void> deleteFieldOfStudy(@PathVariable("id") Long id) {
        try {
            adminService.deleteFieldOfStudy(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (IllegalDeletionAttemptException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/assign-fee-to-student/{index}&{feeId}")
    public ResponseEntity<Void> assignFeeToStudent(@PathVariable("index") String index, @PathVariable("feeId") Long feeId) {
        adminService.assignFeeToStudent(index, feeId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/remove-fee-from-student/{index}&{feeId}")
    public ResponseEntity<Void> removeFeeFromStudent(@PathVariable("index") String index, @PathVariable("feeId") Long feeId) {
        adminService.removeFeeFromStudent(index, feeId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PutMapping("/set-fee-paid/{index}&{feeId}")
    public ResponseEntity<Void> setFeePaid(@PathVariable("index") String index, @PathVariable("feeId") Long feeId) {
        adminService.setFeePaid(index, feeId);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @GetMapping("/student-fees/{index}")
    public ResponseEntity<PaymentsDTO> getStudentFees(@PathVariable("index") String index) {
        PaymentsDTO studentFees = adminService.getFeesByStudentIndex(index);
        return ResponseEntity.ok(studentFees);
    }

}
