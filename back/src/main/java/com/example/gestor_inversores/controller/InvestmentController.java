package com.example.gestor_inversores.controller;

import com.example.gestor_inversores.dto.RequestContractActionByStudentDTO;
import com.example.gestor_inversores.dto.ResponseInvestmentDTO;
import com.example.gestor_inversores.service.investment.IInvestmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/investments")
public class InvestmentController {

    @Autowired
    private IInvestmentService service;

    // 💡 --- NUEVOS ENDPOINTS PARA ACCIONES DEL ESTUDIANTE ---
    @PutMapping("/confirm-receipt/{id}")
    public ResponseInvestmentDTO confirmReceipt(
            @PathVariable("id") Long investmentId,
            @RequestBody @Valid RequestContractActionByStudentDTO dto) {
        return service.confirmReceipt(investmentId, dto.getStudentId());
    }

    @PutMapping("/mark-not-received/{id}")
    public ResponseInvestmentDTO markAsNotReceived(
            @PathVariable("id") Long investmentId,
            @RequestBody @Valid RequestContractActionByStudentDTO dto) {
        return service.markAsNotReceived(investmentId, dto.getStudentId());
    }
    // ---------------------------------------------------------

    @PutMapping("/cancel/{id}")
    public ResponseInvestmentDTO cancelByInvestor(@PathVariable Long id) {
        return service.cancelByInvestor(id);
    }

    @GetMapping("/{id}")
    public ResponseInvestmentDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    public List<ResponseInvestmentDTO> getAll() {
        return service.getAll();
    }

    //Para ver todos las inversiones que estan en estado IN_PROGRESS, RECEIVED, NOT_RECEIVED y deleted != 1
    @GetMapping("/actives")
    public List<ResponseInvestmentDTO> getActiveForStudents() {
        return service.getActiveForStudents();
    }

    //Para ver las inversiones activas por proyecto (para que el estudiante pueda ver las inversiones actuales de su proyecto)
    @GetMapping("/investments-by-project/{projectId}")
    public List<ResponseInvestmentDTO> getActiveByProjectForStudents(@PathVariable Long projectId) {
        return service.getActiveByProjectForStudents(projectId);
    }

    @DeleteMapping("/{id}")
    public ResponseInvestmentDTO delete(@PathVariable Long id) {
        return service.delete(id);
    }
}
