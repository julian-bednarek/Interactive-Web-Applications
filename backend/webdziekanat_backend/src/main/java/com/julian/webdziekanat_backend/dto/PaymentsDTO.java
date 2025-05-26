package com.julian.webdziekanat_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PaymentsDTO {
    private int semester;
    private List<FeeReadDTO> fees;
    private FieldOfStudyReadDTO fieldOfStudy;
}
