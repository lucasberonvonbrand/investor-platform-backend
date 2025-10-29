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
        // Llama a la versión sobrecargada sin dirección de respuesta
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

            // ¡LA MAGIA! Aquí se establece la dirección de respuesta
            if (replyTo != null && !replyTo.isBlank()) {
                message.setReplyTo(replyTo);
            }

            mailSender.send(message);

        } catch (MailException ex) {
            throw new EmailSendException("Error al intentar enviar el correo a " + to);
        }
    }
}
