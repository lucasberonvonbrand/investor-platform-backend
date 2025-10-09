package com.example.gestor_inversores.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RequestRiskPredictionDTO {
    private BigDecimal budgetGoal;       // Objetivo total del proyecto
    private BigDecimal currentGoal;      // Lo que lleva recaudado hasta ahora
    private BigDecimal amount;           // Monto que el inversor quiere aportar
    private String projectStatus;
    private String projectTag;
    private String currency;
    private BigDecimal profit1Year;      // porcentaje sobre amount
    private BigDecimal profit2Years;
    private BigDecimal profit3Years;
    private LocalDate startDate;
    private LocalDate estimatedEndDate;
    private BigDecimal investorAmount;

}
