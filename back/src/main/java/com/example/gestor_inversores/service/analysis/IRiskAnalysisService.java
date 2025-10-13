package com.example.gestor_inversores.service.analysis;

import com.example.gestor_inversores.dto.RequestRiskPredictionDTO;
import com.example.gestor_inversores.dto.ResponseRiskAnalysisDTO;

public interface IRiskAnalysisService {

    ResponseRiskAnalysisDTO analyzeRisk(RequestRiskPredictionDTO dto);

}
