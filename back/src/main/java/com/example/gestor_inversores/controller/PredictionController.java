package com.example.gestor_inversores.controller;

import com.example.gestor_inversores.dto.RequestRiskPredictionDTO;
import com.example.gestor_inversores.dto.ResponseRiskPredictionDTO;
import com.example.gestor_inversores.dto.RequestRiskPredictionDTO;
import com.example.gestor_inversores.dto.ResponseRiskPredictionDTO;
import com.example.gestor_inversores.service.prediction.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;

    @PostMapping("/risk")
    public ResponseEntity<ResponseRiskPredictionDTO> predictRisk(@RequestBody RequestRiskPredictionDTO dto) {
        return ResponseEntity.ok(predictionService.predict(dto));
    }
}
