package com.example.gestor_inversores.controller;

import com.example.gestor_inversores.dto.PasswordResetRequestDTO;
import com.example.gestor_inversores.service.auth.IPasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    @Autowired
    private IPasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody PasswordResetRequestDTO request) {
        passwordResetService.createPasswordResetToken(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Instrucciones para restablecer la contraseña enviadas al correo."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetRequestDTO request) {
        passwordResetService.resetPassword(request.getToken(), request.getPassword());
        return ResponseEntity.ok(Map.of("message", "Contraseña restablecida exitosamente."));
    }
}
