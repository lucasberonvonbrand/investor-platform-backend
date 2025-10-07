package com.example.gestor_inversores.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestEarningDTO {

    @NotNull(message = "El ID del contrato es obligatorio")
    private Long contractId;

    @NotNull(message = "El ID del estudiante generador es obligatorio")
    private Long generatedById;

    @NotNull(message = "El monto base es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal amount;
}
