package com.example.gestor_inversores.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestProjectDTO {

    @NotBlank(message = "El nombre del proyecto es obligatorio")
    @Size(min = 4, max = 100, message = "El nombre debe tener entre 4 y 100 caracteres")
    private String name;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(min = 20, max = 500, message = "La descripción debe tener entre 20 y 500 caracteres")
    private String description;

    @NotNull(message = "El presupuesto objetivo es obligatorio")
    @PositiveOrZero(message = "El presupuesto objetivo debe ser mayor o igual a cero")
    @Digits(integer = 12, fraction = 2, message = "El formato del presupuesto no es válido")
    private BigDecimal budgetGoal;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate startDate;

    @NotNull(message = "La fecha de finalización estimada es obligatoria")
    @FutureOrPresent(message = "La fecha de finalización debe ser hoy o en el futuro")
    private LocalDate estimatedEndDate;

    @NotNull(message = "El propietario del proyecto es obligatorio")
    private Long ownerId;

    private Set<Long> studentIds;

}
