package com.example.gestor_inversores.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonPropertyOrder({"id", "username", "email", "message", "jwt", "status"})
public record AuthLoginResponseDTO(Long id,
                                   String username,
                                   String email,
                                   String message,
                                   String jwt,
                                   boolean status) {
}
