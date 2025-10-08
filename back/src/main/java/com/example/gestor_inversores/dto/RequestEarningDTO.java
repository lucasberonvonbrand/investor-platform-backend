package com.example.gestor_inversores.dto;

import com.example.gestor_inversores.model.enums.Currency;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestEarningDTO {

    /**
     * Para creación manual (opcional). En el flujo automático no se usa.
     */
    private Long contractId;

    @NotNull(message = "El estudiante generador es obligatorio")
    private Long generatedById;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal amount;

    @NotNull(message = "La moneda es obligatoria")
    private Currency currency;
}