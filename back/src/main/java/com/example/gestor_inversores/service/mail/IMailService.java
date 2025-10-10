package com.example.gestor_inversores.service.mail;

import com.example.gestor_inversores.model.Earning;
import com.example.gestor_inversores.model.Project;
import com.example.gestor_inversores.model.Student;

public interface IMailService {

    void sendEmail(String to, String subject, String body);
    void sendEmailToOwner(Project project, Earning earning);
}

