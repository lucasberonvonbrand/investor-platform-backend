package com.example.gestor_inversores.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RequestContractUpdateByStudentDTO {

    @NotNull(message = "El ID del estudiante es obligatorio")
    private Long studentId;

    private String textTitle;

    private String description;

    @DecimalMin(value = "0.01", message = "El monto debe ser mayor que 0")
    private BigDecimal amount;

    @DecimalMin(value = "0.00", message = "El porcentaje de ganancias debe ser mayor o igual a 0")
    private BigDecimal profit1Year;

    @DecimalMin(value = "0.00", message = "El porcentaje de ganancias debe ser mayor o igual a 0")
    private BigDecimal profit2Years;

    @DecimalMin(value = "0.00", message = "El porcentaje de ganancias debe ser mayor o igual a 0")
    private BigDecimal profit3Years;
}
