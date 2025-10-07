package com.example.gestor_inversores.dto;

import com.example.gestor_inversores.model.enums.EarningStatus;
import lombok.Data;

@Data
public class RequestConfirmEarningDTO {
    private Long investorId;
    private EarningStatus status;
}
