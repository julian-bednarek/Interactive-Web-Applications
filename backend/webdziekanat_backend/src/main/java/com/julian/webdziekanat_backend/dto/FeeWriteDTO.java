package com.julian.webdziekanat_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Repository
public class FeeWriteDTO {
    private String description;
    private long facultyId;
    private BigDecimal amount;
    private Long id;
}
