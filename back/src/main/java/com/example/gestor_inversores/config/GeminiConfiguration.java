package com.example.gestor_inversores.config;

import com.google.genai.Client;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfiguration {

    @Bean
    public Client getGeminiClient() {
        return new Client();
    }
}
