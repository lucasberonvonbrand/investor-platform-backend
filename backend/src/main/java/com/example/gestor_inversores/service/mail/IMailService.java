package com.example.gestor_inversores.service.mail;

public interface IMailService {

    void sendEmail(String to, String subject, String body);

    void sendEmail(String to, String subject, String body, String replyTo);

}
