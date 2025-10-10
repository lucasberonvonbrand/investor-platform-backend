package com.example.gestor_inversores.service.mail;

import com.example.gestor_inversores.exception.EmailSendException;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService implements IMailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendEmail(String to, String subject, String body) {
        if (to == null || to.isBlank()) {
            // Retorno silencioso para no romper la lógica de negocio si falta un email.
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
        } catch (Exception ex) {
            // Envolvemos la excepción para un manejo centralizado en el ControllerHandler.
            throw new EmailSendException("Error al intentar enviar el correo a " + to + ": " + ex.getMessage());
        }
    }
}
