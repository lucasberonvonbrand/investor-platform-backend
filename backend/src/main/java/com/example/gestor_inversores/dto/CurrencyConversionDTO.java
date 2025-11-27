package com.example.gestor_inversores.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CurrencyConversionDTO {
    private String fromCurrency;
    private String toCurrency;
    private BigDecimal rate;
}