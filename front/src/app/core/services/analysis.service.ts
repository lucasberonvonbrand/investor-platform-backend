import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// (Opcional pero recomendado) Crea interfaces para tipar tus DTOs
export interface RiskAnalysisRequest {
  projectId: number;
  amount: number;
  currency: string;
  profit1Year: number;
  profit2Years: number;
  profit3Years: number;
}

export interface AnalysisFactor {
  factorName: string;
  factorValue: string;
  factorAssessment: 'Positivo' | 'Neutral' | 'Negativo';
  importancePercentage: number;
  factorDescription: string;
}

export interface ProfitProjection {
  term: string;
  profitRate: string;
  profitAmount: number;
  totalReturn: number;
  apy: string;
}

export interface RiskAnalysisResponse {
  riskCategory: string;
  confidenceScore: number;
  budgetGoal: number;
  currentGoal: number;
  fundingPercentage: number;
  investmentAmount: number;
  investmentCurrency: string;
  timeElapsedPercentage: number;
  fundingStartDate: string;
  fundingEndDate: string;
  estimatedProjectEndDate?: string;
  fundingPace: number;
  analysisFactors: AnalysisFactor[];
  profitProjections: ProfitProjection[];
  riskChartData: any[];
}

export interface CurrencyConversionResponse {
  convertedAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  // La URL ahora es relativa. El proxy se encargará de redirigirla
  // a http://localhost:8080/api/analysis
  private apiUrl = '/api/analysis';
  private currencyApiUrl = '/api/currency';

  constructor(private http: HttpClient) { }

  getRiskAnalysis(requestData: RiskAnalysisRequest): Observable<RiskAnalysisResponse> {
    return this.http.post<RiskAnalysisResponse>(`${this.apiUrl}/risk`, requestData);
  }

  convertCurrency(from: string, to: string, amount: number): Observable<CurrencyConversionResponse> {
    return this.http.get<CurrencyConversionResponse>(`${this.currencyApiUrl}/convert`, { params: { from, to, amount: amount.toString() } });
  }
}
