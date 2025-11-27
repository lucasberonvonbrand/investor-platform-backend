package com.example.gestor_inversores.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddressDTO {

    @NotBlank(message = "La calle no puede estar vacía")
    private String street;

    @Positive(message = "El número debe ser positivo")
    private int number;

    @NotBlank(message = "La ciudad no puede estar vacía")
    private String city;

    @NotNull(message = "La provincia es obligatoria")
    private String province;

    @Positive(message = "El código postal debe ser positivo")
    private int postalCode;

}
