package com.example.gestor_inversores.service.analysis;

import com.example.gestor_inversores.dto.CurrencyConversionDTO;
import com.example.gestor_inversores.dto.RequestRiskPredictionDTO;
import com.example.gestor_inversores.dto.ResponseRiskAnalysisDTO;
import com.example.gestor_inversores.exception.ProjectNotFoundException;
import com.example.gestor_inversores.model.Project;
import com.example.gestor_inversores.model.enums.Currency;
import com.example.gestor_inversores.repository.IProjectRepository;
import com.example.gestor_inversores.service.currency.CurrencyConversionService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import weka.classifiers.Classifier;
import weka.classifiers.trees.RandomForest;
import weka.core.DenseInstance;
import weka.core.Instances;
import weka.core.converters.CSVLoader;

import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RiskPredictionService implements IRiskAnalysisService {

    private final IProjectRepository projectRepository;
    private final CurrencyConversionService currencyConversionService;

    private Classifier riskModel;
    private Instances modelHeader;

    @PostConstruct
    public void trainModel() {
        try {
            InputStream csvStream = RiskPredictionService.class.getClassLoader().getResourceAsStream("risk_dataset.csv");
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

            System.out.println("Modelo de IA para análisis de riesgo entrenado exitosamente.");

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

        // 1. Calcular los features para el modelo
        double progress = calculateProgress(project);
        double impact = calculateImpact(project, dto);
        double profitabilityRatio = calculateProfitabilityRatio(dto);

        // 2. Crear instancia de Weka y predecir
        DenseInstance instance = new DenseInstance(this.modelHeader.numAttributes());
        instance.setDataset(this.modelHeader);
        instance.setValue(0, progress);
        instance.setValue(1, impact);
        instance.setValue(2, profitabilityRatio);

        try {
            // 3. Obtener la predicción y la confianza
            double[] distribution = this.riskModel.distributionForInstance(instance);
            int predictedClassIndex = (int) this.riskModel.classifyInstance(instance);
            String predictedCategory = this.modelHeader.classAttribute().value(predictedClassIndex);
            int confidenceScore = (int) (distribution[predictedClassIndex] * 100);

            // 4. Generar los datos para el informe completo
            List<ResponseRiskAnalysisDTO.AnalysisFactor> factors = generateAnalysisFactors(progress, impact, profitabilityRatio, dto);
            List<ResponseRiskAnalysisDTO.ProfitProjection> projections = generateProfitProjections(dto);
            List<ResponseRiskAnalysisDTO.ChartData> chartData = generateChartData(progress, impact, profitabilityRatio);

            // 5. Devolver la respuesta completa
            return new ResponseRiskAnalysisDTO(predictedCategory, confidenceScore, factors, projections, chartData);

        } catch (Exception e) {
            throw new RuntimeException("Error al realizar la predicción de riesgo", e);
        }
    }

    // --- Métodos de cálculo de Features ---
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

    private double calculateProfitabilityRatio(RequestRiskPredictionDTO dto) {
        final BigDecimal BASELINE_PROFIT_RATE = new BigDecimal("0.08");
        BigDecimal offeredProfit = dto.getProfit1Year();
        if (offeredProfit.compareTo(BigDecimal.ONE) > 0) {
            offeredProfit = offeredProfit.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        }
        return offeredProfit.divide(BASELINE_PROFIT_RATE, 4, RoundingMode.HALF_UP).doubleValue();
    }

    // --- Métodos de generación de datos para el Response DTO ---
    private List<ResponseRiskAnalysisDTO.AnalysisFactor> generateAnalysisFactors(double progress, double impact, double profitabilityRatio, RequestRiskPredictionDTO dto) {
        List<ResponseRiskAnalysisDTO.AnalysisFactor> factors = new ArrayList<>();
        String progressAssessment = progress > 0.75 ? "Positivo" : (progress < 0.25 ? "Negativo" : "Neutral");
        factors.add(new ResponseRiskAnalysisDTO.AnalysisFactor("Progreso del Proyecto", String.format("%.0f%%", progress * 100), progressAssessment, "Mide el estado de financiación actual del proyecto."));

        String impactAssessment = impact > 0.5 ? "Negativo" : (impact < 0.1 ? "Positivo" : "Neutral");
        factors.add(new ResponseRiskAnalysisDTO.AnalysisFactor("Impacto de tu Inversión", String.format("%.0f%% del capital restante", impact * 100), impactAssessment, "Mide qué tan crítica es tu inversión para completar la meta."));

        String profitabilityAssessment = profitabilityRatio > 2.0 ? "Negativo" : (profitabilityRatio < 1.2 ? "Positivo" : "Neutral");
        factors.add(new ResponseRiskAnalysisDTO.AnalysisFactor("Rentabilidad Ofrecida", String.format("%.2f%%", dto.getProfit1Year().doubleValue()), profitabilityAssessment, "Compara la rentabilidad ofrecida con la media del mercado (8%)."));

        return factors;
    }

    private List<ResponseRiskAnalysisDTO.ProfitProjection> generateProfitProjections(RequestRiskPredictionDTO dto) {
        List<ResponseRiskAnalysisDTO.ProfitProjection> projections = new ArrayList<>();
        BigDecimal amount = dto.getAmount();

        BigDecimal profit1 = dto.getProfit1Year().compareTo(BigDecimal.ONE) > 0 ? dto.getProfit1Year().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP) : dto.getProfit1Year();
        BigDecimal profitAmount1 = amount.multiply(profit1).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalReturn1 = amount.add(profitAmount1);
        projections.add(new ResponseRiskAnalysisDTO.ProfitProjection("A 1 Año", String.format("%.2f%%", profit1.multiply(BigDecimal.valueOf(100))), profitAmount1, totalReturn1, calculateApy(totalReturn1, amount, 1)));

        BigDecimal profit2 = dto.getProfit2Years().compareTo(BigDecimal.ONE) > 0 ? dto.getProfit2Years().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP) : dto.getProfit2Years();
        BigDecimal profitAmount2 = amount.multiply(profit2).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalReturn2 = amount.add(profitAmount2);
        projections.add(new ResponseRiskAnalysisDTO.ProfitProjection("A 2 Años", String.format("%.2f%%", profit2.multiply(BigDecimal.valueOf(100))), profitAmount2, totalReturn2, calculateApy(totalReturn2, amount, 2)));

        BigDecimal profit3 = dto.getProfit3Years().compareTo(BigDecimal.ONE) > 0 ? dto.getProfit3Years().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP) : dto.getProfit3Years();
        BigDecimal profitAmount3 = amount.multiply(profit3).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalReturn3 = amount.add(profitAmount3);
        projections.add(new ResponseRiskAnalysisDTO.ProfitProjection("A 3 Años", String.format("%.2f%%", profit3.multiply(BigDecimal.valueOf(100))), profitAmount3, totalReturn3, calculateApy(totalReturn3, amount, 3)));

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
        
        double progressScore = (1 - progress) * 100;
        double impactScore = impact * 100;
        double profitabilityScore = Math.max(0, (profitabilityRatio - 1)) * 100;

        chartData.add(new ResponseRiskAnalysisDTO.ChartData("Riesgo por Progreso", Math.min(100, progressScore)));
        chartData.add(new ResponseRiskAnalysisDTO.ChartData("Riesgo por Impacto", Math.min(100, impactScore)));
        chartData.add(new ResponseRiskAnalysisDTO.ChartData("Riesgo por Rentabilidad", Math.min(100, profitabilityScore)));

        return chartData;
    }
}
