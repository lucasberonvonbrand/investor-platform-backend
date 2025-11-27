package com.example.gestor_inversores.service.auth;

import com.example.gestor_inversores.dto.PasswordResetRequestDTO;
import com.example.gestor_inversores.dto.PasswordResetRequestEmailDTO;
import com.example.gestor_inversores.exception.*;
import com.example.gestor_inversores.model.PasswordResetToken;
import com.example.gestor_inversores.model.User;
import com.example.gestor_inversores.repository.IPasswordResetTokenRepository;
import com.example.gestor_inversores.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService implements IPasswordResetService {

    private final IUserRepository userRepository;
    private final IPasswordResetTokenRepository tokenRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void createPasswordResetToken(PasswordResetRequestEmailDTO dto) {
        String email = dto.getEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EmailNotFoundException("No se encontró un usuario con ese correo."));

        tokenRepository.deleteByUserId(user.getId());

        String token = Base64.getUrlEncoder().encodeToString(
                (user.getId() + "-" + System.currentTimeMillis() + "-" + UUID.randomUUID()).getBytes()
        );

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));

        try {
            tokenRepository.save(resetToken);
        } catch (Exception ex) {
            throw new InvalidTokenException("Error generando token único, intenta de nuevo.");
        }

        try {
            sendPasswordResetEmail(user, resetToken.getToken());
        } catch (Exception ex) {
            throw new EmailSendException("Error al enviar el correo: " + ex.getMessage());
        }
    }

    @Override
    @Transactional
    public void resetPassword(PasswordResetRequestDTO dto) {
        PasswordResetToken resetToken = tokenRepository.findByToken(dto.getToken());
        if (resetToken == null) throw new InvalidTokenException("Token inválido.");

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new ExpiredTokenException("El token ha expirado. Por favor, solicita uno nuevo.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        userRepository.save(user);

        tokenRepository.delete(resetToken);
    }

    private void sendPasswordResetEmail(User user, String token) {
        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(user.getEmail());
        email.setSubject("Restablecer Contraseña");
        email.setText("Para restablecer tu contraseña, haz clic en el siguiente enlace: \n"
                + "http://localhost:8080/api/auth/reset-password?token=" + token);
        mailSender.send(email);
    }
}
