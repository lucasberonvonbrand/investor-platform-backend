package com.example.gestor_inversores.controller;

import com.example.gestor_inversores.dto.RequestRiskPredictionDTO;
import com.example.gestor_inversores.dto.ResponseRiskAnalysisDTO;
import com.example.gestor_inversores.service.analysis.IRiskPredictionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class RiskAnalysisController {

    private final IRiskPredictionService riskAnalysisService;

    @PreAuthorize("hasRole('INVESTOR')")
    @PostMapping("/risk")
    public ResponseEntity<ResponseRiskAnalysisDTO> analyzeInvestmentRisk(
            @Valid @RequestBody RequestRiskPredictionDTO dto) {
        return ResponseEntity.ok(riskAnalysisService.analyzeRisk(dto));
    }
}
