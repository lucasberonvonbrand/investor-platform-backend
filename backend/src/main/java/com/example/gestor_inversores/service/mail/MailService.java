package com.example.gestor_inversores.service.mail;

import com.example.gestor_inversores.exception.EmailSendException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService implements IMailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    @Async
    public void sendEmail(String to, String subject, String body) {
        this.sendEmail(to, subject, body, null);
    }

    @Override
    @Async
    public void sendEmail(String to, String subject, String body, String replyTo) {
        if (to == null || to.isBlank()) {
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            if (replyTo != null && !replyTo.isBlank()) {
                message.setReplyTo(replyTo);
            }

            mailSender.send(message);

        } catch (Exception ex) {
            // Se captura la excepción para no bloquear el flujo de la aplicación (registro, contratos) si el servidor SMTP no está configurado o falla
            System.err.println("[MailService] No se pudo enviar el correo a " + to + ": " + ex.getMessage());
        }
    }
}
