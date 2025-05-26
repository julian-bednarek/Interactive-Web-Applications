package com.julian.webdziekanat_backend.services.interfaces;

import com.julian.webdziekanat_backend.dto.*;
import org.springframework.stereotype.Service;

@Service
public interface StudentService {
    StudentBankAccountsDTO getStudentBankAccounts(String index);
    void updateStudentBankAccounts(String index, StudentBankAccountsDTO studentBankAccountsDTO);
    ReportCardDTO getStudentSubjects(String index, int semester);
    StudentPersonalDTO getStudentPersonalData(String index);
    void updateStudentPersonalData(String index, StudentPersonalDTO studentPersonalDTO);
    FieldOfStudyReadDTO getStudentFieldOfStudy(String index);
    GeneralStudyDTO getStudentGeneralStudy(String index);
    PaymentsDTO getStudentFees(String index, int semester);
    String getStudentIndex(String authID);
}
