package com.example.gestor_inversores.controller;

import com.example.gestor_inversores.dto.*;
import com.example.gestor_inversores.service.admin.IAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final IAdminService adminService;

    @PutMapping("/projects/{id}")
    public ResponseEntity<ResponseProjectDTO> updateProject(
            @PathVariable Long id,
            @RequestBody @Valid RequestAdminProjectUpdateDTO projectUpdateDTO) {
        ResponseProjectDTO updatedProject = adminService.adminUpdateProject(id, projectUpdateDTO);
        return ResponseEntity.ok(updatedProject);
    }

    @PutMapping("/contracts/{id}")
    public ResponseEntity<ResponseContractDTO> updateContract(
            @PathVariable Long id,
            @RequestBody @Valid RequestAdminContractUpdateDTO contractUpdateDTO) {
        ResponseContractDTO updatedContract = adminService.adminUpdateContract(id, contractUpdateDTO);
        return ResponseEntity.ok(updatedContract);
    }

    @PutMapping("/earnings/{id}/status")
    public ResponseEntity<ResponseEarningDTO> updateEarningStatus(
            @PathVariable Long id,
            @RequestBody @Valid RequestAdminUpdateEarningStatusDTO statusDTO) {
        ResponseEarningDTO updatedEarning = adminService.adminUpdateEarningStatus(id, statusDTO);
        return ResponseEntity.ok(updatedEarning);
    }

    @PutMapping("/investments/{id}")
    public ResponseEntity<ResponseInvestmentDTO> updateInvestment(
            @PathVariable Long id,
            @RequestBody @Valid RequestAdminInvestmentUpdateDTO investmentUpdateDTO) {
        ResponseInvestmentDTO updatedInvestment = adminService.adminUpdateInvestment(id, investmentUpdateDTO);
        return ResponseEntity.ok(updatedInvestment);
    }
}
