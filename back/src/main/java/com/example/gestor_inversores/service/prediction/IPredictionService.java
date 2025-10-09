package com.example.gestor_inversores.service.prediction;

import com.example.gestor_inversores.dto.RequestRiskPredictionDTO;
import com.example.gestor_inversores.dto.ResponseRiskPredictionDTO;

public interface IPredictionService {

    /**
     * Realiza una predicción de nivel de riesgo en base a los datos del proyecto.
     *
     * @param dto Datos de entrada para la predicción.
     * @return Objeto con el nivel de riesgo y la confianza de la predicción.
     */
    ResponseRiskPredictionDTO predict(RequestRiskPredictionDTO dto);
}
