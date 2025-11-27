package com.example.gestor_inversores.controller;

import com.example.gestor_inversores.service.ia.IGeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatBotController {

    private final IGeminiService geminiService;

    @PostMapping
    public ResponseEntity<String> askChatBot(@RequestBody String prompt) {
        return ResponseEntity.status(HttpStatus.OK).body(geminiService.askSupportBot(prompt));
    }
}
