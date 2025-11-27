package com.example.gestor_inversores.dto;

import com.example.gestor_inversores.model.enums.Currency;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestRiskPredictionDTO {

    @NotNull(message = "El ID del proyecto es obligatorio")
    private Long projectId;

    @NotNull(message = "El monto de la inversión es obligatorio")
    @Positive(message = "El monto debe ser positivo")
    private BigDecimal amount;

    @NotNull(message = "La moneda es obligatoria")
    private Currency currency;

    @NotNull(message = "La rentabilidad a 1 año es obligatoria")
    private BigDecimal profit1Year;

    @NotNull(message = "La rentabilidad a 2 años es obligatoria")
    private BigDecimal profit2Years;

    @NotNull(message = "La rentabilidad a 3 años es obligatoria")
    private BigDecimal profit3Years;
}
