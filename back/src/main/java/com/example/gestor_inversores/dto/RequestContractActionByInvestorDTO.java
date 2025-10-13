package com.example.gestor_inversores.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestContractActionByInvestorDTO {

    @NotNull(message = "El ID del inversor es obligatorio")
    private Long investorId;
}
