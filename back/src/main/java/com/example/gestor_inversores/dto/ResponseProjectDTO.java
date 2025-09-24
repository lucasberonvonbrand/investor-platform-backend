package com.example.gestor_inversores.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponseProjectDTO {

    private Long id;
    private String name;
    private String description;
    private BigDecimal budgetGoal;
    private BigDecimal currentGoal;
    private String status;
    private LocalDate startDate;
    private LocalDate estimatedEndDate;
    private LocalDate endDate;
}
