package com.example.gestor_inversores.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ResponseRiskPredictionDTO {
    private String riskLevel;
    private double confidence;
}
