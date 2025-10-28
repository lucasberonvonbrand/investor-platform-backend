package com.example.gestor_inversores.dto;

import com.example.gestor_inversores.model.enums.ContractStatus;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractActionDTO {

    private Long actionId;       // ID único de la acción
    private Long contractId;     // ID del contrato al que pertenece
    private Long studentId;      // ID del estudiante que realizó la acción
    private ContractStatus status;     // Estado que se registró en la acción
    private LocalDate actionDate;  // Fecha de la acción
}
