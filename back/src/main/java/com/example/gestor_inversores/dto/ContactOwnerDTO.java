package com.example.gestor_inversores.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactOwnerDTO {

    @NotBlank(message = "El email del remitente es obligatorio")
    @Email(message = "El email del remitente debe ser válido")
    private String fromEmail;

    @NotBlank(message = "El nombre del remitente es obligatorio")
    private String fromName;

    @NotBlank(message = "El asunto es obligatorio")
    private String subject;

    @NotBlank(message = "El mensaje es obligatorio")
    private String message;
}
