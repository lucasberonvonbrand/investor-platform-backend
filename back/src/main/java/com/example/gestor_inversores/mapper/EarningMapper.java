package com.example.gestor_inversores.mapper;

import com.example.gestor_inversores.dto.RequestEarningDTO;
import com.example.gestor_inversores.dto.ResponseEarningDTO;
import com.example.gestor_inversores.model.Earning;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class EarningMapper {

    public ResponseEarningDTO toResponse(Earning e) {
        ResponseEarningDTO dto = new ResponseEarningDTO();
        dto.setIdEarning(e.getIdEarning());
        dto.setAmount(e.getAmount());
        dto.setBaseAmount(e.getBaseAmount());
        dto.setProfitRate(e.getProfitRate());
        dto.setProfitAmount(e.getProfitAmount());
        dto.setCurrency(e.getCurrency());
        dto.setStatus(e.getStatus());
        dto.setCreatedAt(e.getCreatedAt());
        dto.setConfirmedAt(e.getConfirmedAt());
        dto.setContractId(e.getContract().getIdContract());
        dto.setProjectId(e.getProject().getIdProject());
        dto.setGeneratedById(e.getGeneratedBy().getId());
        dto.setConfirmedById(e.getConfirmedBy() != null ? e.getConfirmedBy().getId() : null);
        return dto;
    }

    public Earning fromRequest(RequestEarningDTO dto) {
        if (dto == null) return null;
        Earning e = new Earning();
        e.setAmount(dto.getAmount());
        e.setCurrency(dto.getCurrency());
        e.setCreatedAt(java.time.LocalDate.now());
        // status y relaciones se setean en el servicio
        return e;
    }
}
