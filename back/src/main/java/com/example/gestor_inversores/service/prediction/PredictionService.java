package com.example.gestor_inversores.service.prediction;

import com.example.gestor_inversores.dto.RequestRiskPredictionDTO;
import com.example.gestor_inversores.dto.ResponseRiskPredictionDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import weka.classifiers.trees.RandomForest;
import weka.core.Instances;
import weka.core.converters.CSVLoader;
import weka.core.DenseInstance;
import weka.core.Attribute;
import weka.core.SerializationHelper;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.FileInputStream;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class PredictionService {

    private static final String MODEL_PATH = "models/risk_prediction_rf.model";
    private static final String CSV_PATH = "src/main/resources/risk_training_data.csv";

    private RandomForest classifier;

    @PostConstruct
    public void init() {
        log.info("Inicializando servicio de predicción con RandomForest...");
        loadOrTrainModel();
    }

    private void loadOrTrainModel() {
        File modelFile = new File(MODEL_PATH);
        if (modelFile.exists()) {
            try (FileInputStream fis = new FileInputStream(MODEL_PATH)) {
                classifier = (RandomForest) SerializationHelper.read(fis);
                log.info("✅ Modelo RandomForest cargado correctamente desde {}", MODEL_PATH);
            } catch (Exception e) {
                log.error("⚠️ Error al cargar el modelo existente. Se entrenará uno nuevo.", e);
                trainModelFromCSV();
            }
        } else {
            log.info("⚙️ No se encontró un modelo previo. Entrenando desde CSV...");
            trainModelFromCSV();
        }
    }

    private void trainModelFromCSV() {
        try {
            CSVLoader loader = new CSVLoader();
            loader.setSource(new File(CSV_PATH));
            Instances dataset = loader.getDataSet();
            dataset.setClassIndex(dataset.numAttributes() - 1); // última columna = riskLevel

            classifier = new RandomForest();
            classifier.buildClassifier(dataset);

            File modelDir = new File("models");
            if (!modelDir.exists()) modelDir.mkdirs();

            SerializationHelper.write(MODEL_PATH, classifier);
            log.info("✅ RandomForest entrenado y guardado en {}", MODEL_PATH);
        } catch (Exception e) {
            log.error("❌ Error entrenando RandomForest desde CSV", e);
        }
    }

    public ResponseRiskPredictionDTO predict(RequestRiskPredictionDTO dto) {
        try {
            if (classifier == null)
                throw new IllegalStateException("El modelo aún no fue entrenado o cargado");

            // Creamos el dataset temporal para la instancia
            Instances dataset = createDataset();
            DenseInstance instance = new DenseInstance(dataset.numAttributes());
            instance.setDataset(dataset);

            // Duración en días del proyecto
            double durationDays = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEstimatedEndDate());

            // Convertimos los profits de porcentaje a valor absoluto según el monto invertido
            double profit1 = dto.getAmount().doubleValue() * dto.getProfit1Year().doubleValue() / 100.0;
            double profit2 = dto.getAmount().doubleValue() * dto.getProfit2Years().doubleValue() / 100.0;
            double profit3 = dto.getAmount().doubleValue() * dto.getProfit3Years().doubleValue() / 100.0;

            // Asignamos valores a la instancia
            instance.setValue(dataset.attribute("budgetGoal"), dto.getBudgetGoal().doubleValue());
            instance.setValue(dataset.attribute("currentGoal"), dto.getCurrentGoal().doubleValue());
            instance.setValue(dataset.attribute("projectStatus"), dto.getProjectStatus());
            instance.setValue(dataset.attribute("projectTag"), dto.getProjectTag());
            instance.setValue(dataset.attribute("currency"), dto.getCurrency());
            instance.setValue(dataset.attribute("profit1Year"), profit1);
            instance.setValue(dataset.attribute("profit2Years"), profit2);
            instance.setValue(dataset.attribute("profit3Years"), profit3);
            instance.setValue(dataset.attribute("durationDays"), durationDays);
            instance.setValue(dataset.attribute("amount"), dto.getAmount().doubleValue());


            // Predicción con RandomForest
            double predictionIndex = classifier.classifyInstance(instance);
            String predictedClass = dataset.classAttribute().value((int) predictionIndex);

            // Probabilidad de la predicción
            double[] distribution = classifier.distributionForInstance(instance);
            double confidence = distribution[(int) predictionIndex];

            // Retornamos DTO con el resultado
            return ResponseRiskPredictionDTO.builder()
                    .riskLevel(predictedClass)
                    .confidence(confidence)
                    .build();

        } catch (Exception e) {
            log.error("❌ Error al realizar la predicción con RandomForest", e);
            throw new RuntimeException("Error al predecir el riesgo");
        }
    }

    private Instances createDataset() {
        ArrayList<Attribute> attributes = new ArrayList<>();
        attributes.add(new Attribute("budgetGoal"));
        attributes.add(new Attribute("currentGoal"));
        attributes.add(new Attribute("profit1Year"));
        attributes.add(new Attribute("profit2Years"));
        attributes.add(new Attribute("profit3Years"));
        attributes.add(new Attribute("durationDays"));

        ArrayList<String> projectStatusValues = new ArrayList<>(List.of("IN_PROGRESS", "PENDING_FUNDING", "COMPLETED"));
        attributes.add(new Attribute("projectStatus", projectStatusValues));

        ArrayList<String> tagValues = new ArrayList<>(List.of("TECH", "SCIENCE", "HEALTH", "OTHER"));
        attributes.add(new Attribute("projectTag", tagValues));

        ArrayList<String> currencyValues = new ArrayList<>(List.of("USD", "ARS", "EUR", "CNY"));
        attributes.add(new Attribute("currency", currencyValues));

        ArrayList<String> classValues = new ArrayList<>(List.of("BAJO", "MEDIO", "ALTO"));
        Attribute classAttr = new Attribute("riskLevel", classValues);
        attributes.add(classAttr);

        Instances dataset = new Instances("RiskDataset", attributes, 0);
        dataset.setClass(classAttr);
        return dataset;
    }
}
