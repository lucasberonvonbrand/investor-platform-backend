package com.example.gestor_inversores.dto;

import com.example.gestor_inversores.model.enums.DegreeStatus;
import com.example.gestor_inversores.model.enums.University;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class RequestStudentUpdateDTO {

    // Para PATCH, los campos son opcionales, por lo que se quita @NotBlank/@NotNull
    // pero se mantienen las validaciones de formato si el campo es proporcionado.

    @Size(min = 3, max = 50, message = "Si se proporciona, el username debe tener entre 3 y 50 caracteres")
    private String username;

    @Email(message = "Si se proporciona, el email debe tener un formato válido")
    private String email;

    private String photoUrl;

    @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
    private String firstName;

    @Size(max = 100, message = "El apellido no puede superar 100 caracteres")
    private String lastName;

    @Size(max = 20, message = "El DNI no puede superar 20 caracteres")
    private String dni;

    @Size(max = 50, message = "El teléfono no puede superar 50 caracteres")
    private String phone;

    @Past(message = "Si se proporciona, la fecha de nacimiento debe ser anterior a la fecha actual")
    private LocalDate dateOfBirth;

    private University university;

    private String career;

    private DegreeStatus degreeStatus;

    @Pattern(regexp = "^(https?://.*|linkedin\\.com/.*)?$", message = "Si se proporciona, debe ser una URL válida")
    private String linkedinUrl;

    @Size(max = 500, message = "La descripción puede tener hasta 500 caracteres")
    private String description;

    @Valid // Si se proporciona una dirección, debe ser validada en cascada
    private AddressDTO address;

}
