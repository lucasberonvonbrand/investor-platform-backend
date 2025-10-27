package com.example.gestor_inversores.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EarningsSummaryDTO {

    private BigDecimal totalEarnings;
    private BigDecimal totalBaseAmount;
    private BigDecimal totalProfitAmount;
    private long totalCount;
    private Map<String, BigDecimal> totalEarningsByCurrency;
}
