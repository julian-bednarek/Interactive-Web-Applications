package com.julian.webdziekanat_backend.dto;

import com.julian.webdziekanat_backend.model.Teacher;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class TeacherWriteDTO extends PersonDTO {
    public TeacherWriteDTO(Teacher teacher) {
        super(teacher.getFirstName(), teacher.getLastName(), teacher.getFatherName(), teacher.getPESEL(), teacher.getEDeliveryEmail(), teacher.getFaculty().getId(), teacher.getPlaceOfBirth(), new AddressDTO(teacher.getAddress()), teacher.getPhoneNumber(), teacher.getAuth0().getAuth0_id(), teacher.getId());
        this.academicTitle = teacher.getAcademicTitle();
    }

    private String academicTitle;
}
