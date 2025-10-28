package com.example.gestor_inversores.dto;

import com.example.gestor_inversores.model.enums.Currency;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestContractUpdateByInvestorDTO {

    @NotNull(message = "El ID del inversor es obligatorio")
    private Long investorId;

    private String textTitle;

    private String description;

    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    @Digits(integer = 13, fraction = 2, message = "El formato del monto no es válido")
    private BigDecimal amount;

    private Currency currency; // La validación del enum es automática

    @DecimalMin(value = "0.00", message = "El profit 1 año debe ser >= 0")
    private BigDecimal profit1Year;

    @DecimalMin(value = "0.00", message = "El profit 2 años debe ser >= 0")
    private BigDecimal profit2Years;

    @DecimalMin(value = "0.00", message = "El profit 3 años debe ser >= 0")
    private BigDecimal profit3Years;
}
