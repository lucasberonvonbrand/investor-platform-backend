package com.example.gestor_inversores.controller;

import com.example.gestor_inversores.dto.CurrencyConversionDTO;
import com.example.gestor_inversores.service.currency.CurrencyConversionService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;

@RestController
@RequiredArgsConstructor
public class CurrencyController {

    private final CurrencyConversionService conversionService;

    @Data
    @AllArgsConstructor
    public static class ConversionResultDTO {
        private BigDecimal originalAmount;
        private String fromCurrency;
        private String toCurrency;
        private BigDecimal convertedAmount;
    }

    @GetMapping(value = "/api/currency/convert", params = {"from", "to", "!amount"})
    public CurrencyConversionDTO getRate(@RequestParam String from, @RequestParam String to) {
        return conversionService.getConversionRate(from, to);
    }

    @GetMapping(value = "/api/currency/convert", params = {"from", "to", "amount"})
    public ConversionResultDTO convert(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam BigDecimal amount
    ) {
        CurrencyConversionDTO conversionRateDTO = conversionService.getConversionRate(from, to);
        BigDecimal rate = conversionRateDTO.getRate();
        BigDecimal convertedAmount = amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);

        return new ConversionResultDTO(amount, from, to, convertedAmount);
    }
}
