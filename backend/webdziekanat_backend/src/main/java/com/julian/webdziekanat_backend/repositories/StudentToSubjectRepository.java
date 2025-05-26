package com.julian.webdziekanat_backend.repositories;

import com.julian.webdziekanat_backend.dto.SubjectReadDTO;
import com.julian.webdziekanat_backend.model.Student;
import com.julian.webdziekanat_backend.model.StudentToSubject;
import com.julian.webdziekanat_backend.model.Subject;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentToSubjectRepository extends JpaRepository<StudentToSubject, Long> {
    List<StudentToSubject> findByStudentId(Long studentId);
    List<StudentToSubject> findBySubjectCode(String subjectCode);

    @Transactional
    @Modifying
    @Query("""
    DELETE FROM StudentToSubject ss WHERE ss.student.indexNumber = :index
    """)
    void deleteStudentSubjects(@Param("index") String indexNumber);

    List<StudentToSubject> findAllByStudentAndSemester(Student student, int semester);

    List<StudentToSubject> findAllBySubjectCode(String subjectCode);

    @Query("""
        SELECT ss FROM StudentToSubject ss
        WHERE ss.student.indexNumber = :studentIndex
    """)
    List<StudentToSubject> findByStudentIndex(String studentIndex);
}