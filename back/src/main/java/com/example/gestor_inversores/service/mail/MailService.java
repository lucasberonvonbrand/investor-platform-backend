package com.example.gestor_inversores.service.mail;

import com.example.gestor_inversores.exception.BusinessException;
import com.example.gestor_inversores.exception.EmailNotFoundException;
import com.example.gestor_inversores.model.Earning;
import com.example.gestor_inversores.model.Project;
import com.example.gestor_inversores.model.Student;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService implements IMailService {

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendEmail(String to, String subject, String body) {
        if (to == null || to.isBlank()) return;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
    }

    @Override
    public void sendEmailToOwner(Project project, Earning earning) {
        if (project == null || project.getOwner() == null) {
            throw new BusinessException("The project or its owner is missing");
        }

        String email = project.getOwner().getEmail();
        if (email == null || email.isBlank()) {
            throw new EmailNotFoundException("The project owner does not have a valid email address");
        }

        String subject = "Alerta: Ganancia no recibida";
        String body = "El inversor " + earning.getConfirmedBy().getUsername() +
                " reportó que no recibió la ganancia del contrato " + earning.getContract().getIdContract() +
                " del proyecto " + project.getName() + ". Por favor, comuníquese con el inversor para resolverlo.";

        sendEmail(email, subject, body);
    }

}

