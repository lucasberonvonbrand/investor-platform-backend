package com.example.gestor_inversores.service.currency;

import com.example.gestor_inversores.dto.CurrencyConversionDTO;
import com.example.gestor_inversores.exception.CurrencyConversionException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CurrencyConversionService {

    private static final Logger log = LoggerFactory.getLogger(CurrencyConversionService.class);

    @Value("${exchangerate.api.key}")
    private String apiKey;

    private static final String API_URL = "https://v6.exchangerate-api.com/v6/%s/latest/%s";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Cacheable(value = "conversionRates", key = "#from + '-' + #to")
    public CurrencyConversionDTO getConversionRate(String from, String to) {
        log.info("CACHÉ MISS: Llamando a la API externa para obtener la tasa de {} a {}", from, to);
        String url = String.format(API_URL, apiKey, from);

        try {
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode rates = root.path("conversion_rates");

            if (rates.isMissingNode() || !rates.has(to)) {
                log.error("La respuesta de la API no contiene la tasa para la moneda: {}", to);
                throw new CurrencyConversionException("No se encontró la tasa de conversión de " + from + " a " + to);
            }

            BigDecimal rate = rates.get(to).decimalValue();
            log.info("Tasa obtenida: 1 {} = {} {}. Guardando en caché.", from, rate, to);

            return new CurrencyConversionDTO(from, to, rate);

        } catch (RestClientException e) {
            log.error("Error de red al intentar conectar con la API de conversión de moneda: {}", e.getMessage());
            throw new CurrencyConversionException("No se pudo conectar con el servicio de conversión de moneda.");
        } catch (Exception e) {
            log.error("Error al procesar la respuesta de la API de conversión de moneda", e);
            throw new CurrencyConversionException("Error al obtener la tasa de conversión de " + from + " a " + to);
        }
    }
}
