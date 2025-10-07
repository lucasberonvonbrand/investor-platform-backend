package com.example.gestor_inversores.dto;

import com.example.gestor_inversores.model.enums.Currency;
import com.example.gestor_inversores.model.enums.EarningStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResponseEarningDTO {

    private Long idEarning;
    private EarningStatus status;

    private BigDecimal amount; // monto final con profit
    private BigDecimal baseAmount; // monto original sin profit
    private Currency currency;
    private LocalDate createdAt;
    private LocalDate confirmedAt;

    private Long projectId;
    private String projectTitle;

    private Long generatedById;
    private String generatedByName;

    private Long confirmedById;
    private String confirmedByName;

    private Long contractId;
}
