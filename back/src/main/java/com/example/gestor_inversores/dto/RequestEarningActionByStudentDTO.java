package com.example.gestor_inversores.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestEarningActionByStudentDTO {

    @NotNull(message = "El ID del estudiante no puede ser nulo.")
    private Long studentId;
}
