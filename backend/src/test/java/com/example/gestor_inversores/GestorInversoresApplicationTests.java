package com.example.gestor_inversores;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class GestorInversoresApplicationTests {

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Test
    void contextLoads() {
        // Verifica que el contexto de Spring levante sin errores
    }

    @Test
    void testH2DatabaseConfigured() {
        // Verifica que estemos usando la URL de H2 configurada en application-test.properties
        Assertions.assertTrue(datasourceUrl.contains("h2:mem:testdb"), 
            "La base de datos deberia ser H2 en memoria, pero la URL es: " + datasourceUrl);
    }
}
