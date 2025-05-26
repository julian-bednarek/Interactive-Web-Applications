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
public class ReportCardDTO {
    private List<SubjectReadDTO> subjects;
    private int semester;
    private int ECTScolleted;
    private int ECTSsum;
    private int average;
}
