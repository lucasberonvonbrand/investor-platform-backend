package com.example.gestor_inversores.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.core.io.Resource;

@AllArgsConstructor
@Getter
public class ResponseFile {
    private Resource resource;
    private String fileName;
    private String contentType;
}
