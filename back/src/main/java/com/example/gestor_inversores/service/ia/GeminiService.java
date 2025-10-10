package com.example.gestor_inversores.service.ia;

import com.google.genai.Client;
import com.google.genai.types.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class GeminiService {

    private final Client client;

    public String askGemini(String prompt) {

        GenerateContentConfig config = GenerateContentConfig.builder()
                .temperature(0.0F)
                .topK(1F)
                .build();

        GenerateContentResponse response =
                client.models.generateContent(
                        "gemini-2.5-flash",
                        prompt,
                        config
                );

        return response.text();
    }
}
