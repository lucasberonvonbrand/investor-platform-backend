package com.example.gestor_inversores.dto;

import com.example.gestor_inversores.model.enums.Currency;
import com.example.gestor_inversores.model.enums.EarningStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponseEarningDTO {

    private Long idEarning;
    private BigDecimal amount; // monto de la ganancia
    private BigDecimal profitRate; // porcentaje aplicado, ej 0.06
    private Currency currency;
    private EarningStatus status;
    private LocalDate createdAt;
    private LocalDate confirmedAt;
    private Long contractId;
    private Long projectId;
    private Long generatedById;
    private Long confirmedById;
    private BigDecimal baseAmount;   // inversión inicial
    private BigDecimal profitAmount; // ganancia calculada

}
