package com.example.gestor_inversores.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResponseRiskAnalysisDTO {

    // --- El Resultado Principal ---
    private String riskCategory;
    private int riskScore;

    // --- El Desglose del Riesgo ---
    private List<AnalysisFactor> analysisFactors;

    // --- Proyección de Ganancias ---
    private List<ProfitProjection> profitProjections;

    // --- Datos para el Gráfico ---
    private List<ChartData> riskChartData;

    // --- Clase interna para describir cada factor de riesgo ---
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AnalysisFactor {
        private String factorName;
        private String factorValue;
        private String factorAssessment;
        private String factorDescription;
    }

    // --- Clase interna para describir cada proyección de ganancia ---
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProfitProjection {
        private String term;
        private String profitRate;
        private BigDecimal profitAmount;
        private BigDecimal totalReturn;
        private String apy;
    }

    // --- Clase interna para los datos del gráfico ---
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChartData {
        private String name;
        private double value;
    }
}
