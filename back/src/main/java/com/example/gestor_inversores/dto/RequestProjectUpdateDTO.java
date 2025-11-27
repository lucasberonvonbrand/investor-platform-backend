package com.example.gestor_inversores.dto;

import com.example.gestor_inversores.model.enums.ProjectStatus;
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
public class RequestProjectUpdateDTO {

    @NotBlank(message = "Debe contener un valor")
    @Size(min = 4, max = 100)
    private String name;

    @NotBlank(message = "Debe contener un valor")
    @Size(min = 20, max = 500)
    private String description;

    @NotNull(message = "No puede ser nulo")
    @PositiveOrZero(message = "El monto debe ser mayor o igual a cero")
    @Digits(integer = 12, fraction = 2, message = "El monto debe tener hasta 12 dígitos enteros y 2 decimales")
    private BigDecimal budgetGoal;

    @NotNull(message = "Debe contener un valor")
    private ProjectStatus status;

    @NotNull(message = "No puede ser nulo")
    private LocalDate startDate;

    @NotNull(message = "No puede ser nulo")
    @FutureOrPresent(message = "La fecha debe ser actual o futura")
    private LocalDate estimatedEndDate;

    @NotNull(message = "El monto es obligatorio")
    @PositiveOrZero(message = "El monto debe ser mayor o igual a cero")
    @Digits(integer = 12, fraction = 2, message = "El monto debe tener hasta 12 dígitos enteros y 2 decimales")
    private BigDecimal currentGoal;

    private Set<Long> studentIds;
}
