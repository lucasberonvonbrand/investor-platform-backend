package com.example.gestor_inversores;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync(proxyTargetClass = true)
@EnableCaching // <-- AÑADIDO PARA HABILITAR EL CACHÉ
public class GestorInversoresApplication {

	public static void main(String[] args) {
		SpringApplication.run(GestorInversoresApplication.class, args);
	}

}
