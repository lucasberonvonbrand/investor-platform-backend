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

    // Inyectamos el email remitente desde application.properties para mayor claridad
    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    @Async // ¡MAGIA! Esto hace que el método se ejecute en un hilo separado.
    public void sendEmail(String to, String subject, String body) {
        if (to == null || to.isBlank()) {
            // Retorno silencioso para no romper la lógica de negocio si falta un email.
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail); // Hacemos explícito quién envía el correo
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

        } catch (MailException ex) {
            // Atrapamos la excepción específica de Spring Mail.
            // Mantenemos la excepción personalizada para el manejo global.
            throw new EmailSendException("Error al intentar enviar el correo a " + to);
        }
    }
}
