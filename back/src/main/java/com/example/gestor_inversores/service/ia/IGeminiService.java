package com.example.gestor_inversores.service.ia;

public interface IGeminiService {

    String askGemini(String prompt);
    String askSupportBot(String userQuery);
}
