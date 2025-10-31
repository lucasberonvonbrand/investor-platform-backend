package com.example.gestor_inversores.mapper;

import com.example.gestor_inversores.dto.RequestAdminContractUpdateDTO;
import com.example.gestor_inversores.dto.RequestAdminInvestmentUpdateDTO;
import com.example.gestor_inversores.dto.RequestAdminProjectUpdateDTO;
import com.example.gestor_inversores.model.Contract;
import com.example.gestor_inversores.model.Investment;
import com.example.gestor_inversores.model.Project;
import org.springframework.stereotype.Component;

@Component
public class AdminMapper {

    public void updateProjectFromDto(RequestAdminProjectUpdateDTO dto, Project project) {
        if (dto.getName() != null) project.setName(dto.getName());
        if (dto.getDescription() != null) project.setDescription(dto.getDescription());
        if (dto.getBudgetGoal() != null) project.setBudgetGoal(dto.getBudgetGoal());
        if (dto.getStatus() != null) project.setStatus(dto.getStatus());
        if (dto.getStartDate() != null) project.setStartDate(dto.getStartDate());
        if (dto.getEstimatedEndDate() != null) project.setEstimatedEndDate(dto.getEstimatedEndDate());
        if (dto.getEndDate() != null) project.setEndDate(dto.getEndDate());
        if (dto.getDeleted() != null) project.setDeleted(dto.getDeleted());
    }

    public void updateContractFromDto(RequestAdminContractUpdateDTO dto, Contract contract) {
        if (dto.getTextTitle() != null) contract.setTextTitle(dto.getTextTitle());
        if (dto.getDescription() != null) contract.setDescription(dto.getDescription());
        if (dto.getAmount() != null) contract.setAmount(dto.getAmount());
        if (dto.getCurrency() != null) contract.setCurrency(dto.getCurrency());
        if (dto.getStatus() != null) contract.setStatus(dto.getStatus());
        if (dto.getProfit1Year() != null) contract.setProfit1Year(dto.getProfit1Year());
        if (dto.getProfit2Years() != null) contract.setProfit2Years(dto.getProfit2Years());
        if (dto.getProfit3Years() != null) contract.setProfit3Years(dto.getProfit3Years());
        if (dto.getInvestorSigned() != null) contract.setInvestorSigned(dto.getInvestorSigned());
        if (dto.getInvestorSignedDate() != null) contract.setInvestorSignedDate(dto.getInvestorSignedDate());
        if (dto.getStudentSigned() != null) contract.setStudentSigned(dto.getStudentSigned());
        if (dto.getStudentSignedDate() != null) contract.setStudentSignedDate(dto.getStudentSignedDate());
    }
}
