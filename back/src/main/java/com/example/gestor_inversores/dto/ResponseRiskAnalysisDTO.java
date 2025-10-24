package com.example.gestor_inversores.dto;

import com.example.gestor_inversores.model.enums.Currency;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResponseRiskAnalysisDTO {

    // --- El Resultado Principal ---
    private String riskCategory;
    private int confidenceScore;

    // --- Datos de la Inversión Propuesta ---
    private BigDecimal investmentAmount;
    private Currency investmentCurrency;

    // --- Datos de Financiación del Proyecto (siempre en USD) ---
    private BigDecimal budgetGoal;
    private BigDecimal currentGoal;
    private double fundingPercentage;

    // --- Contexto Temporal del Proyecto ---
    private LocalDate fundingStartDate;
    private LocalDate fundingEndDate;
    private double timeElapsedPercentage;
    private double fundingPace;

    // --- El Desglose del Riesgo ---
    private List<AnalysisFactor> analysisFactors;

    // --- Proyección de Ganancias (en la moneda de la inversión) ---
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
        private double importancePercentage; // Porcentaje de importancia del factor
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
