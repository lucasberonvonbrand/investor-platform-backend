package com.example.gestor_inversores.service.analysis;

import com.example.gestor_inversores.dto.CurrencyConversionDTO;
import com.example.gestor_inversores.dto.RequestRiskPredictionDTO;
import com.example.gestor_inversores.dto.ResponseRiskAnalysisDTO;
import com.example.gestor_inversores.exception.BusinessException;
import com.example.gestor_inversores.exception.ProjectNotFoundException;
import com.example.gestor_inversores.model.Project;
import com.example.gestor_inversores.model.enums.Currency;
import com.example.gestor_inversores.repository.IProjectRepository;
import com.example.gestor_inversores.service.currency.CurrencyConversionService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import weka.attributeSelection.InfoGainAttributeEval;
import weka.classifiers.Classifier;
import weka.classifiers.trees.RandomForest;
import weka.core.DenseInstance;
import weka.core.Instances;
import weka.core.converters.CSVLoader;

import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RiskPredictionService implements IRiskAnalysisService {

    private final IProjectRepository projectRepository;
    private final CurrencyConversionService currencyConversionService;

    private Classifier riskModel;
    private Instances modelHeader;
    private Map<String, Double> featureImportances; // Mapa para almacenar las importancias
    private static final int FUNDING_DEADLINE_DAYS = 90;

    @PostConstruct
    public void trainModel() {
        try (InputStream csvStream = RiskPredictionService.class.getClassLoader().getResourceAsStream("risk_dataset.csv")) {
            if (csvStream == null) {
                throw new RuntimeException("No se pudo encontrar el dataset: risk_dataset.csv");
            }

            CSVLoader loader = new CSVLoader();
            loader.setSource(csvStream);
            Instances trainingData = loader.getDataSet();
            trainingData.setClassIndex(trainingData.numAttributes() - 1);

            this.modelHeader = new Instances(trainingData, 0);
            this.modelHeader.setClassIndex(this.modelHeader.numAttributes() - 1);

            this.riskModel = new RandomForest();
            this.riskModel.buildClassifier(trainingData);

            System.out.println("Modelo de IA para análisis de riesgo entrenado exitosamente con dataset de plazo fijo.");

            calculateAndStoreFeatureImportances(trainingData);

        } catch (Exception e) {
            throw new RuntimeException("Error crítico al entrenar el modelo de IA", e);
        }
    }

    @Override
    public ResponseRiskAnalysisDTO analyzeRisk(RequestRiskPredictionDTO dto) {
        if (this.riskModel == null) {
            throw new IllegalStateException("El modelo de IA no está disponible o no ha sido entrenado.");
        }

        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ProjectNotFoundException("Proyecto no encontrado"));

        // --- MEJORA: Validar si el período de financiación ha terminado ---
        double timeElapsedPercentage = calculateTimeElapsedPercentage(project);
        if (timeElapsedPercentage >= 1.0) {
            throw new BusinessException("El período de financiación para este proyecto ha finalizado. No se puede realizar un nuevo análisis de riesgo.");
        }

        validateOfferAmount(project, dto.getAmount(), dto.getCurrency());

        // 1. Calcular todos los features para el modelo
        double progress = calculateProgress(project);
        double impact = calculateImpact(project, dto);
        
        BigDecimal p1 = normalizeProfit(dto.getProfit1Year());
        BigDecimal p2 = normalizeProfit(dto.getProfit2Years());
        BigDecimal p3 = normalizeProfit(dto.getProfit3Years());

        double profitabilityRatio = calculateProfitabilityRatio(p1, p2, p3);

        double fundingPace = calculateFundingPace(progress, timeElapsedPercentage);

        // 2. Crear instancia de Weka con la misma estructura que el CSV
        DenseInstance instance = new DenseInstance(this.modelHeader.numAttributes());
        instance.setDataset(this.modelHeader);
        instance.setValue(0, progress);
        instance.setValue(1, impact);
        instance.setValue(2, p1.doubleValue());
        instance.setValue(3, p2.doubleValue());
        instance.setValue(4, p3.doubleValue());
        instance.setValue(5, profitabilityRatio);
        instance.setValue(6, timeElapsedPercentage);
        instance.setValue(7, fundingPace);

        try {
            // 3. Obtener la predicción y la confianza
            double[] distribution = this.riskModel.distributionForInstance(instance);
            int predictedClassIndex = (int) this.riskModel.classifyInstance(instance);
            String predictedCategory = this.modelHeader.classAttribute().value(predictedClassIndex); // e.g., "Alto"
            int confidenceScore = (int) (distribution[predictedClassIndex] * 100); // e.g., 67

            // 4. Generar los datos para el informe completo
            List<ResponseRiskAnalysisDTO.AnalysisFactor> factors = generateAnalysisFactors(progress, impact, profitabilityRatio, fundingPace);
            List<ResponseRiskAnalysisDTO.ProfitProjection> projections = generateProfitProjections(dto);
            List<ResponseRiskAnalysisDTO.ChartData> chartData = generateChartData(progress, impact, profitabilityRatio);

            // 5. Devolver la respuesta completa
            ResponseRiskAnalysisDTO response = new ResponseRiskAnalysisDTO();
            response.setRiskCategory(predictedCategory);
            response.setConfidenceScore(confidenceScore);
            response.setInvestmentAmount(dto.getAmount());
            response.setInvestmentCurrency(dto.getCurrency());
            response.setBudgetGoal(project.getBudgetGoal());
            response.setCurrentGoal(project.getCurrentGoal());
            response.setFundingPercentage(progress * 100);
            response.setTimeElapsedPercentage(timeElapsedPercentage * 100);
            response.setFundingPace(fundingPace);
            response.setFundingStartDate(project.getCreatedAt().toLocalDate());
            response.setFundingEndDate(project.getCreatedAt().toLocalDate().plusDays(FUNDING_DEADLINE_DAYS));
            response.setAnalysisFactors(factors);
            response.setProfitProjections(projections);
            response.setRiskChartData(chartData);

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Error al realizar la predicción de riesgo", e);
        }
    }

    private void validateOfferAmount(Project project, BigDecimal amount, Currency currency) {
        BigDecimal remainingBudget = project.getBudgetGoal().subtract(project.getCurrentGoal());
        BigDecimal offerAmountInUSD = amount;

        if (currency != Currency.USD) {
            offerAmountInUSD = currencyConversionService.getConversionRate(currency.name(), "USD")
                    .getRate().multiply(amount);
        }

        if (offerAmountInUSD.compareTo(remainingBudget) > 0) {
            throw new BusinessException(String.format(
                    "El monto a analizar (%.2f USD) supera el capital restante para financiar el proyecto (%.2f USD).",
                    offerAmountInUSD, remainingBudget));
        }
    }

    // --- Métodos de cálculo de Features ---
    private BigDecimal normalizeProfit(BigDecimal profit) {
        return profit.compareTo(BigDecimal.ONE) > 0 ? profit.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP) : profit;
    }

    private double calculateProgress(Project project) {
        BigDecimal budgetGoal = project.getBudgetGoal();
        BigDecimal currentGoal = project.getCurrentGoal();
        if (budgetGoal == null || budgetGoal.compareTo(BigDecimal.ZERO) <= 0) {
            return 0.0;
        }
        return currentGoal.divide(budgetGoal, 4, RoundingMode.HALF_UP).doubleValue();
    }

    private double calculateImpact(Project project, RequestRiskPredictionDTO dto) {
        BigDecimal needed = project.getBudgetGoal().subtract(project.getCurrentGoal());
        if (needed.compareTo(BigDecimal.ZERO) <= 0) {
            return 0.0;
        }
        BigDecimal investmentAmountUSD = dto.getAmount();
        if (dto.getCurrency() != Currency.USD) {
            CurrencyConversionDTO conversionDTO = currencyConversionService.getConversionRate(dto.getCurrency().name(), Currency.USD.name());
            investmentAmountUSD = dto.getAmount().multiply(conversionDTO.getRate());
        }
        return investmentAmountUSD.divide(needed, 4, RoundingMode.HALF_UP).doubleValue();
    }

    private double calculateProfitabilityRatio(BigDecimal p1, BigDecimal p2, BigDecimal p3) {
        final BigDecimal P1_WEIGHT = new BigDecimal("0.5");
        final BigDecimal P2_WEIGHT = new BigDecimal("0.3");
        final BigDecimal P3_WEIGHT = new BigDecimal("0.2");
        final BigDecimal BASELINE_PROFIT_RATE = new BigDecimal("0.08");

        BigDecimal weightedProfit = (p1.multiply(P1_WEIGHT))
                                    .add(p2.multiply(P2_WEIGHT))
                                    .add(p3.multiply(P3_WEIGHT));

        return weightedProfit.divide(BASELINE_PROFIT_RATE, 4, RoundingMode.HALF_UP).doubleValue();
    }

    private double calculateTimeElapsedPercentage(Project project) {
        LocalDateTime createdAt = project.getCreatedAt();
        if (createdAt == null) {
            return 1.0; // Si no hay fecha de creación, se asume 100% transcurrido
        }

        long daysSinceCreation = ChronoUnit.DAYS.between(createdAt.toLocalDate(), LocalDate.now());
        return Math.max(0, Math.min(1.0, (double) daysSinceCreation / FUNDING_DEADLINE_DAYS));
    }

    private double calculateFundingPace(double progress, double timeElapsedPercentage) {
        if (timeElapsedPercentage == 0) {
            return progress > 0 ? 2.0 : 1.0; // Normalizado como en el script de Python
        }
        return progress / timeElapsedPercentage;
    }

    private void calculateAndStoreFeatureImportances(Instances trainingData) throws Exception {
        InfoGainAttributeEval eval = new InfoGainAttributeEval();
        eval.buildEvaluator(trainingData);
    
        int numFeatures = trainingData.numAttributes() - 1; // Exclude the class attribute
        Map<String, Double> rawImportances = new HashMap<>();
        double totalImportance = 0;
    
        for (int i = 0; i < numFeatures; i++) {
            String featureName = trainingData.attribute(i).name();
            double importance = eval.evaluateAttribute(i);
            rawImportances.put(featureName, importance);
            totalImportance += importance;
        }
    
        this.featureImportances = new HashMap<>();
        for (Map.Entry<String, Double> entry : rawImportances.entrySet()) {
            double normalizedImportance = (totalImportance > 0) ? (entry.getValue() / totalImportance) * 100 : 0.0;
            this.featureImportances.put(entry.getKey(), normalizedImportance);
        }
    
        System.out.println("Importancia de features (InfoGain) calculada y almacenada.");
        System.out.println(this.featureImportances);
    }

    // --- Métodos de generación de datos para el Response DTO ---
    // Constants for assessment thresholds
    private static final double PACE_NEGATIVE_THRESHOLD = 0.8;
    private static final double PACE_POSITIVE_THRESHOLD = 1.2;
    private static final double PROGRESS_NEGATIVE_THRESHOLD = 0.25;
    private static final double PROGRESS_POSITIVE_THRESHOLD = 0.75;
    private static final double IMPACT_NEGATIVE_THRESHOLD = 0.5; // High dependency is negative
    private static final double IMPACT_POSITIVE_THRESHOLD = 0.1; // Low dependency is positive
    private static final double PROFITABILITY_NEGATIVE_THRESHOLD = 0.9;
    private static final double PROFITABILITY_POSITIVE_THRESHOLD = 1.5;

    private List<ResponseRiskAnalysisDTO.AnalysisFactor> generateAnalysisFactors(double progress, double impact, double profitabilityRatio, double fundingPace) {
        List<ResponseRiskAnalysisDTO.AnalysisFactor> factors = new ArrayList<>();
        
        if (this.featureImportances == null) {
            this.featureImportances = new HashMap<>();
        }

        factors.add(new ResponseRiskAnalysisDTO.AnalysisFactor(
                "Ritmo de Financiación",
                String.format("%.2f", fundingPace),
                getAssessmentForPace(fundingPace),
                this.featureImportances.getOrDefault("funding_pace", 0.0),
                "Compara el % de financiación con el % de tiempo transcurrido. Un ritmo > 1 es bueno."
        ));

        factors.add(new ResponseRiskAnalysisDTO.AnalysisFactor(
                "Progreso del Proyecto",
                String.format("%.0f%%", progress * 100),
                getAssessmentForProgress(progress),
                this.featureImportances.getOrDefault("progress", 0.0),
                "Mide el estado de financiación actual del proyecto."
        ));

        factors.add(new ResponseRiskAnalysisDTO.AnalysisFactor(
                "Dependencia de tu Inversión",
                String.format("%.0f%% del capital restante", impact * 100),
                getAssessmentForImpact(impact),
                this.featureImportances.getOrDefault("impact", 0.0),
                "Mide cuánto depende el proyecto de tu inversión para completarse. Una dependencia baja es positiva."
        ));

        factors.add(new ResponseRiskAnalysisDTO.AnalysisFactor(
                "Rentabilidad Ofrecida",
                String.format("Ratio vs. Mercado: %.2f", profitabilityRatio),
                getAssessmentForProfitability(profitabilityRatio),
                // Sum the importances of the individual profit features
                this.featureImportances.getOrDefault("p1", 0.0) +
                this.featureImportances.getOrDefault("p2", 0.0) +
                this.featureImportances.getOrDefault("p3", 0.0) +
                this.featureImportances.getOrDefault("profitability_ratio", 0.0),
                "Compara la rentabilidad ponderada ofrecida con la media del mercado (8%). Un ratio > 1 es mejor."
        ));

        return factors;
    }

    // Métodos auxiliares para las evaluaciones (para mantener generateAnalysisFactors más limpio)
    private String getAssessmentForPace(double fundingPace) {
        if (fundingPace < PACE_NEGATIVE_THRESHOLD) return "Negativo";
        else if (fundingPace > PACE_POSITIVE_THRESHOLD) return "Positivo";
        else return "Neutral";
    }

    private String getAssessmentForProgress(double progress) {
        if (progress > PROGRESS_POSITIVE_THRESHOLD) return "Positivo";
        else if (progress < PROGRESS_NEGATIVE_THRESHOLD) return "Negativo";
        else return "Neutral";
    }

    private String getAssessmentForImpact(double impact) {
        if (impact > IMPACT_NEGATIVE_THRESHOLD) return "Negativo"; // High dependency is negative
        else if (impact < IMPACT_POSITIVE_THRESHOLD) return "Positivo"; // Low dependency is positive
        else return "Neutral";
    }

    private String getAssessmentForProfitability(double profitabilityRatio) {
        if (profitabilityRatio > PROFITABILITY_POSITIVE_THRESHOLD) return "Positivo";
        else if (profitabilityRatio < PROFITABILITY_NEGATIVE_THRESHOLD) return "Negativo";
        else return "Neutral";
    }

    private List<ResponseRiskAnalysisDTO.ProfitProjection> generateProfitProjections(RequestRiskPredictionDTO dto) {
        List<ResponseRiskAnalysisDTO.ProfitProjection> projections = new ArrayList<>();
        BigDecimal amount = dto.getAmount();

        BigDecimal p1 = normalizeProfit(dto.getProfit1Year());
        BigDecimal p2 = normalizeProfit(dto.getProfit2Years());
        BigDecimal p3 = normalizeProfit(dto.getProfit3Years());

        projections.add(new ResponseRiskAnalysisDTO.ProfitProjection("A 1 Año", String.format("%.2f%%", p1.multiply(BigDecimal.valueOf(100))), amount.multiply(p1).setScale(2, RoundingMode.HALF_UP), amount.add(amount.multiply(p1)), calculateApy(amount.add(amount.multiply(p1)), amount, 1)));
        projections.add(new ResponseRiskAnalysisDTO.ProfitProjection("A 2 Años", String.format("%.2f%%", p2.multiply(BigDecimal.valueOf(100))), amount.multiply(p2).setScale(2, RoundingMode.HALF_UP), amount.add(amount.multiply(p2)), calculateApy(amount.add(amount.multiply(p2)), amount, 2)));
        projections.add(new ResponseRiskAnalysisDTO.ProfitProjection("A 3 Años", String.format("%.2f%%", p3.multiply(BigDecimal.valueOf(100))), amount.multiply(p3).setScale(2, RoundingMode.HALF_UP), amount.add(amount.multiply(p3)), calculateApy(amount.add(amount.multiply(p3)), amount, 3)));

        return projections;
    }

    private String calculateApy(BigDecimal totalReturn, BigDecimal principal, int years) {
        if (principal.compareTo(BigDecimal.ZERO) == 0 || years <= 0) {
            return "N/A";
        }
        double ratio = totalReturn.divide(principal, 10, RoundingMode.HALF_UP).doubleValue();
        double exponent = 1.0 / years;
        double apy = Math.pow(ratio, exponent) - 1;
        return String.format("%.2f%%", apy * 100);
    }

    private List<ResponseRiskAnalysisDTO.ChartData> generateChartData(double progress, double impact, double profitabilityRatio) {
        List<ResponseRiskAnalysisDTO.ChartData> chartData = new ArrayList<>();
        
        // Risk by Progress: Higher progress means lower risk. Max risk at 0% progress.
        double progressRiskScore = (1 - progress) * 100;

        // Risk by Dependency: Higher dependency (impact) means higher risk.
        double dependencyRiskScore = impact * 100;

        // Risk by Profitability: Risk only exists if profitability is "Negative".
        // If ratio is below the negative threshold, risk increases as the ratio gets smaller.
        // Otherwise, the risk is 0.
        double profitabilityRiskScore = (profitabilityRatio < PROFITABILITY_NEGATIVE_THRESHOLD) ?
                ((PROFITABILITY_NEGATIVE_THRESHOLD - profitabilityRatio) / PROFITABILITY_NEGATIVE_THRESHOLD) * 100 : 0;

        chartData.add(new ResponseRiskAnalysisDTO.ChartData("Riesgo por Progreso", Math.min(100, Math.max(0, progressRiskScore))));
        chartData.add(new ResponseRiskAnalysisDTO.ChartData("Riesgo por Dependencia", Math.min(100, Math.max(0, dependencyRiskScore))));
        chartData.add(new ResponseRiskAnalysisDTO.ChartData("Riesgo por Rentabilidad", Math.min(100, Math.max(0, profitabilityRiskScore))));

        return chartData;
    }
}
