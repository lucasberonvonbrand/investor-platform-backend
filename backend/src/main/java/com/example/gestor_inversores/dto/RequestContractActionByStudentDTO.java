package com.example.gestor_inversores.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestContractActionByStudentDTO {

    @NotNull(message = "El ID del estudiante es obligatorio para realizar esta acción")
    private Long studentId;

}
