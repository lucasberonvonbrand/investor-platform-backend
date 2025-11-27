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

    private String riskCategory;
    private int confidenceScore;

    private BigDecimal investmentAmount;
    private Currency investmentCurrency;

    private BigDecimal budgetGoal;
    private BigDecimal currentGoal;
    private double fundingPercentage;

    private LocalDate fundingStartDate;
    private LocalDate fundingEndDate;
    private LocalDate estimatedProjectEndDate;
    private double timeElapsedPercentage;
    private double fundingPace;

    private List<AnalysisFactor> analysisFactors;

    private List<ProfitProjection> profitProjections;

    private List<ChartData> riskChartData;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AnalysisFactor {
        private String factorName;
        private String factorValue;
        private String factorAssessment;
        private double importancePercentage;
        private String factorDescription;
    }

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

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChartData {
        private String name;
        private double value;
    }
}
