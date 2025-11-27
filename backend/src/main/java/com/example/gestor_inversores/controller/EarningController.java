package com.example.gestor_inversores.controller;

import com.example.gestor_inversores.dto.EarningsSummaryDTO;
import com.example.gestor_inversores.dto.RequestEarningActionByStudentDTO;
import com.example.gestor_inversores.dto.RequestEarningActionDTO;
import com.example.gestor_inversores.dto.ResponseEarningDTO;
import com.example.gestor_inversores.model.enums.EarningStatus;
import com.example.gestor_inversores.service.earning.IEarningService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/earnings")
@RequiredArgsConstructor
@Validated
public class EarningController {

    private final IEarningService earningService;

    @PreAuthorize("hasRole('STUDENT')")
    @PutMapping("/confirm-payment-sent/{id}")
    public ResponseEntity<ResponseEarningDTO> confirmPaymentSent(
            @PathVariable("id") Long earningId,
            @RequestBody @Valid RequestEarningActionByStudentDTO dto) {
        return ResponseEntity.ok(earningService.confirmPaymentSent(earningId, dto.getStudentId()));
    }

    @PreAuthorize("hasRole('INVESTOR')")
    @PutMapping("/confirm-receipt/{id}")
    public ResponseEntity<ResponseEarningDTO> confirmReceipt(
            @PathVariable("id") Long earningId,
            @RequestBody @Valid RequestEarningActionDTO dto) {
        return ResponseEntity.ok(earningService.confirmReceipt(earningId, dto.getInvestorId()));
    }

    @PreAuthorize("hasRole('INVESTOR')")
    @PutMapping("/mark-not-received/{id}")
    public ResponseEntity<ResponseEarningDTO> markAsNotReceived(
            @PathVariable("id") Long earningId,
            @RequestBody @Valid RequestEarningActionDTO dto) {
        return ResponseEntity.ok(earningService.markAsNotReceived(earningId, dto.getInvestorId()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<ResponseEarningDTO>> getAll() {
        return ResponseEntity.ok(earningService.getAll());
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'INVESTOR', 'ADMIN')")
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ResponseEarningDTO>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(earningService.getByProject(projectId));
    }

    @PreAuthorize("hasAnyRole('INVESTOR', 'ADMIN')")
    @GetMapping("/investor/{investorId}")
    public ResponseEntity<List<ResponseEarningDTO>> getByInvestor(
            @PathVariable Long investorId,
            @RequestParam(required = false) EarningStatus status) {
        return ResponseEntity.ok(earningService.getByInvestor(investorId, status));
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ResponseEarningDTO>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(earningService.getByStudent(studentId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/summary")
    public ResponseEntity<EarningsSummaryDTO> getEarningsSummary() {
        return ResponseEntity.ok(earningService.getEarningsSummary());
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'INVESTOR', 'ADMIN')")
    @GetMapping("/by-project/{projectId}")
    public ResponseEntity<List<ResponseEarningDTO>> getByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(earningService.getByProjectId(projectId));
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'INVESTOR', 'ADMIN')")
    @GetMapping("/by-contract/{contractId}")
    public ResponseEntity<List<ResponseEarningDTO>> getByContractId(@PathVariable Long contractId) {
        return ResponseEntity.ok(earningService.getByContractId(contractId));
    }
}
