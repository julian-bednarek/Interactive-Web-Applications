package com.julian.webdziekanat_backend.controllers;

import com.julian.webdziekanat_backend.dto.SubjectGradesEditDTO;
import com.julian.webdziekanat_backend.dto.SubjectTeacherReadDTO;
import com.julian.webdziekanat_backend.services.interfaces.TeacherGradeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/teacher")
@PreAuthorize("hasAnyAuthority('read:everything', 'write:everything', 'read:teacher', 'write:teacher')")
public class TeacherRESTController {

    private final TeacherGradeService teacherGradeService;

    public TeacherRESTController(TeacherGradeService teacherGradeService) {
        this.teacherGradeService = teacherGradeService;
    }

    @GetMapping("/subjects/{id}")
    @PreAuthorize("hasPermission(#id, 'read:teacher') or hasAuthority('read:everything')")
    public ResponseEntity<List<SubjectTeacherReadDTO>> getTeacherSubjects(@PathVariable("id") Long id) {
        return ResponseEntity.ok(teacherGradeService.getSubjectsFromTeacher(id));
    }

    @GetMapping("/grades/{id}/{subjectCode}")
    @PreAuthorize("hasPermission(#teacherId, 'read:teacher') or hasAuthority('read:everything')")
    public ResponseEntity<SubjectGradesEditDTO> getStudentsFromSubject(@PathVariable("subjectCode") String subjectCode,
                                                                       @PathVariable("id") Long teacherId) {
        return ResponseEntity.ok(teacherGradeService.getStudentsFromSubject(subjectCode));
    }

    @PutMapping("/grades/{id}/{subjectCode}&{index}")
    @PreAuthorize("hasPermission(#teacherId, 'write:teacher') or hasAuthority('write:everything')")
    public ResponseEntity<Void> updateFinalGrade(@PathVariable("index") String studentIndex,
                                                 @PathVariable("subjectCode") String subjectCode,
                                                 @PathVariable("id") long teacherId,
                                                 @RequestBody double finalGrade) {
        teacherGradeService.updateFinalGrade(studentIndex, subjectCode, finalGrade);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/teacher-id/{auth0Id}")
    public ResponseEntity<Long> getTeacherIdByAuth0(@PathVariable("auth0Id") String auth0Id) {
        return ResponseEntity.ok(teacherGradeService.getTeacherIdByAuth0(auth0Id));
    }
}
