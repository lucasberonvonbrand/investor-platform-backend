package com.example.gestor_inversores.dto;

import com.example.gestor_inversores.model.enums.ContractStatus;
import com.example.gestor_inversores.model.enums.Currency;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestAdminContractUpdateDTO {
    private String textTitle;
    private String description; // Corresponde a las cláusulas
    private BigDecimal amount;
    private Currency currency;
    private ContractStatus status;
    private BigDecimal profit1Year;
    private BigDecimal profit2Years;
    private BigDecimal profit3Years;
    private Boolean investorSigned;
    private LocalDate investorSignedDate;
    private Boolean studentSigned;
    private LocalDate studentSignedDate;
}
