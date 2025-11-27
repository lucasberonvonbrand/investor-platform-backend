package com.example.gestor_inversores.controller;

import com.example.gestor_inversores.dto.PasswordResetRequestDTO;
import com.example.gestor_inversores.dto.PasswordResetRequestEmailDTO;
import com.example.gestor_inversores.dto.PasswordResetResponseDTO;
import com.example.gestor_inversores.service.auth.IPasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    private final IPasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<PasswordResetResponseDTO> forgotPassword(
            @RequestBody @Valid PasswordResetRequestEmailDTO request) {
        passwordResetService.createPasswordResetToken(request);
        return ResponseEntity.ok(new PasswordResetResponseDTO(
                "Instrucciones para restablecer la contraseña enviadas al correo."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<PasswordResetResponseDTO> resetPassword(
            @RequestBody @Valid PasswordResetRequestDTO request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok(new PasswordResetResponseDTO("Contraseña restablecida exitosamente."));
    }

}
