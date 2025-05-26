package com.julian.webdziekanat_backend.repositories;

import com.julian.webdziekanat_backend.dto.SubjectReadDTO;
import com.julian.webdziekanat_backend.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, String> {
    @Query("""
        SELECT new com.julian.webdziekanat_backend.dto.SubjectReadDTO(
            s.code,
            s.name,
            s.ECTS,
            t.academicTitle || ' ' || t.lastName || ' ' || t.firstName,
            sts.finalGrade
        )
        FROM Subject s
        JOIN s.studentToSubjects sts
        JOIN sts.student st
        LEFT JOIN s.teacher t
        WHERE st.id = :studentId
        AND sts.semester = :semester
    """)
    List<SubjectReadDTO> findAllSubjectsWithFinalGradeForStudentAndSemester(
            @Param("studentId") Long studentId,
            @Param("semester") Integer semester
    );

    @Modifying
    @Query("UPDATE Subject s SET s.teacher = :teacherId WHERE s.code = :subjectId")
    void updateSubjectTeacher(@Param("subjectId") String subjectId, @Param("teacherId") Long teacherId);

    List<Subject> findAllByTeacherId(Long teacherId);
}