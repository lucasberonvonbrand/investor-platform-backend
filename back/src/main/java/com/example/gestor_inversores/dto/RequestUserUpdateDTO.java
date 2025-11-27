package com.example.gestor_inversores.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class RequestUserUpdateDTO {

    @Size(min = 3, max = 50, message = "Si se proporciona, el username debe tener entre 3 y 50 caracteres")
    private String username;

    @Email(message = "Si se proporciona, el email debe tener un formato válido")
    private String email;

    @Pattern(regexp = "^(https?://).*$", message = "Si se proporciona, debe ser una URL válida")
    private String photoUrl;

    private Boolean enabled;
    private Boolean accountNotExpired;
    private Boolean accountNotLocked;
    private Boolean credentialNotExpired;

    private Set<Long> rolesIds;
}
