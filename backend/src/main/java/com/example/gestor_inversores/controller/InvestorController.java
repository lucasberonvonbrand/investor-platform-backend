package com.example.gestor_inversores.controller;

import com.example.gestor_inversores.dto.RequestInvestorDTO;
import com.example.gestor_inversores.dto.RequestInvestorUpdateByAdminDTO;
import com.example.gestor_inversores.dto.RequestInvestorUpdateDTO;
import com.example.gestor_inversores.dto.ResponseInvestorDTO;
import com.example.gestor_inversores.repository.IInvestorRepository;
import com.example.gestor_inversores.service.investor.IInvestorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/investors")
@RequiredArgsConstructor
public class InvestorController {

    private final IInvestorService investorService;
    private final IInvestorRepository investorRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<ResponseInvestorDTO>> getAllInvestors() {
        return ResponseEntity.ok(investorService.findAll());
    }

    @PreAuthorize("hasAnyRole('INVESTOR', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ResponseInvestorDTO> getInvestorById(@PathVariable Long id) {
        return ResponseEntity.ok(investorService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ResponseInvestorDTO> createInvestor(@Valid @RequestBody RequestInvestorDTO requestDTO) {
        ResponseInvestorDTO savedInvestor = investorService.save(requestDTO);
        return ResponseEntity.ok(savedInvestor);
    }

    @PreAuthorize("hasAnyRole('INVESTOR', 'ADMIN')")
    @PutMapping("/update-by-admin/{id}")
    public ResponseEntity<ResponseInvestorDTO> updateByAdmin(
            @PathVariable Long id,
            @Valid @RequestBody RequestInvestorUpdateByAdminDTO dto) {
        ResponseInvestorDTO updatedInvestor = investorService.updateByAdmin(id, dto);
        return ResponseEntity.ok(updatedInvestor);
    }

    @PreAuthorize("hasRole('INVESTOR')")
    @PatchMapping("/{id}")
    public ResponseEntity<ResponseInvestorDTO> patchInvestor(
            @PathVariable Long id,
            @Valid @RequestBody RequestInvestorUpdateDTO patchDto) {
        return ResponseEntity.ok(investorService.patchInvestor(id, patchDto));
    }

    @PreAuthorize("hasAnyRole('INVESTOR', 'ADMIN')")
    @PatchMapping("/activate/{id}")
    public ResponseEntity<ResponseInvestorDTO> activateInvestor(@PathVariable Long id) {
        return ResponseEntity.ok(investorService.activateInvestor(id));
    }

    @PreAuthorize("hasAnyRole('INVESTOR', 'ADMIN')")
    @PatchMapping("/desactivate/{id}")
    public ResponseEntity<ResponseInvestorDTO> desactivateInvestor(@PathVariable Long id) {
        return ResponseEntity.ok(investorService.desactivateInvestor(id));
    }

    @GetMapping("/check-cuit/{cuit}")
    public ResponseEntity<Boolean> checkCuitExists(@PathVariable String cuit) {
        return ResponseEntity.ok(investorRepository.findByCuit(cuit).isPresent());
    }

}
