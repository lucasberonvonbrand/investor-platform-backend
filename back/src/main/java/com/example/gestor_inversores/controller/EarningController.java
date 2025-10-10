package com.example.gestor_inversores.controller;

import com.example.gestor_inversores.dto.RequestConfirmEarningDTO;
import com.example.gestor_inversores.dto.RequestEarningDTO;
import com.example.gestor_inversores.dto.ResponseEarningDTO;
import com.example.gestor_inversores.model.enums.EarningStatus;
import com.example.gestor_inversores.service.earning.IEarningService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/earnings")
@RequiredArgsConstructor
@Validated
public class EarningController {

    private final IEarningService earningService;

    // listado general
    @GetMapping
    public ResponseEntity<List<ResponseEarningDTO>> getAll() {
        return ResponseEntity.ok(earningService.getAll());
    }

    // por proyecto
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ResponseEarningDTO>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(earningService.getByProject(projectId));
    }

    // por inversor (confirmados por ese inversor)
    @GetMapping("/investor/{investorId}")
    public ResponseEntity<List<ResponseEarningDTO>> getByInvestor(@PathVariable Long investorId) {
        return ResponseEntity.ok(earningService.getByInvestor(investorId));
    }

    // por estudiante (generadas por ese estudiante)
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ResponseEarningDTO>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(earningService.getByStudent(studentId));
    }

    // confirmar earning por inversor: body tiene investorId y status (RECEIVED/NOT_RECEIVED)
    @PutMapping("/confirm/{earningId}")
    public ResponseEntity<ResponseEarningDTO> confirmEarning(
            @PathVariable Long earningId,
            @RequestBody RequestConfirmEarningDTO request) {

        return ResponseEntity.ok(
                earningService.confirmEarning(earningId, request.getInvestorId(), request.getStatus())
        );
    }


    // endpoint opcional para crear manualmente (no hace falta si todo es automático)
    @PostMapping
    public ResponseEntity<ResponseEarningDTO> createManual(@Valid @RequestBody RequestEarningDTO dto) {
        ResponseEarningDTO created = earningService.createManual(
                dto.getGeneratedById(),
                dto.getContractId(),
                dto.getAmount(),
                dto.getCurrency()
        );
        return ResponseEntity.ok(created);
    }
}
