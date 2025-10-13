package com.example.gestor_inversores.mapper;

import com.example.gestor_inversores.dto.ResponseInvestmentDTO;
import com.example.gestor_inversores.model.Investment;
import org.springframework.stereotype.Component;

@Component
public class InvestmentMapper {

    public ResponseInvestmentDTO toResponse(Investment inv) {
        ResponseInvestmentDTO dto = new ResponseInvestmentDTO();
        dto.setIdInvestment(inv.getIdInvestment());
        dto.setStatus(inv.getStatus());
        dto.setAmount(inv.getAmount());
        dto.setCurrency(inv.getCurrency());
        dto.setCreatedAt(inv.getCreatedAt());
        dto.setConfirmedAt(inv.getConfirmedAt());
        dto.setGeneratedById(inv.getGeneratedBy().getId());
        dto.setProjectId(inv.getProject().getIdProject());
        dto.setConfirmedByStudentId(inv.getConfirmedBy() != null ? inv.getConfirmedBy().getId() : null);
        return dto;
    }

}