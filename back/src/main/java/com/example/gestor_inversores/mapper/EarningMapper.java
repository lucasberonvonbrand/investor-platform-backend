package com.example.gestor_inversores.mapper;

import com.example.gestor_inversores.dto.RequestEarningDTO;
import com.example.gestor_inversores.dto.ResponseEarningDTO;
import com.example.gestor_inversores.model.Earning;
import org.springframework.stereotype.Component;

@Component
public class EarningMapper {

    public Earning toEntity(RequestEarningDTO dto) {
        Earning e = new Earning();
        e.setAmount(dto.getAmount());
        return e;
    }

    public ResponseEarningDTO toDTO(Earning earning) {
        ResponseEarningDTO dto = new ResponseEarningDTO();
        dto.setIdEarning(earning.getIdEarning());
        dto.setStatus(earning.getStatus());
        dto.setAmount(earning.getAmount());
        dto.setCurrency(earning.getCurrency());
        dto.setCreatedAt(earning.getCreatedAt());
        dto.setConfirmedAt(earning.getConfirmedAt());
        dto.setProjectId(earning.getProject().getIdProject());
        dto.setProjectTitle(earning.getProject().getName());
        dto.setGeneratedById(earning.getGeneratedBy().getId());
        dto.setGeneratedByName(earning.getGeneratedBy().getFirstName() + " " + earning.getGeneratedBy().getLastName());
        if (earning.getConfirmedBy() != null) {
            dto.setConfirmedById(earning.getConfirmedBy().getId());
            dto.setConfirmedByName(earning.getConfirmedBy().getContactPerson());
        }
        dto.setContractId(earning.getContract().getIdContract());
        return dto;
    }
}
