package com.example.gestor_inversores.dto;

import com.example.gestor_inversores.model.enums.ProjectStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponseProjectByStudentDTO {
    private Long idProject;
    private String name;
    private String description;
    private BigDecimal budgetGoal;
    private BigDecimal currentGoal;
    private ProjectStatus status;
    private LocalDate startDate;
    private LocalDate estimatedEndDate;
    private LocalDate endDate;
}
