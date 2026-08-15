import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, takeUntil, finalize } from 'rxjs';

import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { 
  AnalysisService, 
  RiskAnalysisRequest, 
  RiskAnalysisResponse, 
  CurrencyConversionResponse, 
  AnalysisFactor 
} from '../../../core/services/analysis.service';

@Component({
  standalone: true,
  selector: 'app-risk-analysis-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxChartsModule,
    ToolbarModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './risk-analysis-page.component.html',
  styles: [`
    :host {
      --primary-color: #7c3aed;
      --primary-hover-color: #6d28d9;
      --secondary-color: #94a3b8;
      --success-color: #10b981;
      --warning-color: #f59e0b;
      --danger-color: #ef4444;
      --light-color: #121c33;
      --dark-color: #f8fafc;
      --text-color: #cbd5e1;
      --border-color: #1e293b;
      --background-color: #0d1527;
      --page-background: #030712;
      --card-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      --card-hover-shadow: 0 15px 35px rgba(0, 0, 0, 0.7);
      --border-radius: 1rem;
      --transition-speed: 0.2s ease-in-out;
      display: block;
      background-color: #030712;
      min-height: 100vh;
      color: #f8fafc;
      padding: 1rem 1.5rem 3rem;
    }

    .container, .results-container {
      max-width: 960px;
      margin: 1.5rem auto;
      padding: 2rem;
      background-color: #0d1527 !important;
      border: 1px solid #1e293b !important;
      border-radius: var(--border-radius);
      box-shadow: var(--card-shadow);
      color: #f8fafc !important;
    }

    h1, h2, h3 {
      color: #ffffff !important;
      margin-bottom: 0.75rem;
    }

    h1 {
      text-align: center;
      font-size: 2.25rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      letter-spacing: -0.025em;
    }

    .subtitle {
      text-align: center;
      color: #94a3b8 !important;
      margin-bottom: 2rem;
      font-size: 1rem;
      line-height: 1.5;
    }

    h2 {
      font-size: 1.8rem;
      color: #ffffff !important;
      text-align: center;
    }

    h3 {
      font-size: 1.35rem;
      border-left: 4px solid var(--primary-color);
      padding-left: 1rem;
      margin: 2rem 0 1.25rem;
      font-weight: 800;
    }

    .title-with-tooltip {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    hr {
      border: 0;
      border-top: 1px solid #1e293b;
      margin: 2rem 0;
    }

    .analysis-form .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .analysis-form .form-field {
      display: flex;
      flex-direction: column;
    }

    .analysis-form .form-field label {
      margin-bottom: 0.4rem;
      font-weight: 700;
      color: #94a3b8;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .analysis-form .form-field input, .analysis-form .form-field select {
      padding: 0.8rem 1rem;
      border: 1px solid #1e293b;
      border-radius: 0.75rem;
      font-size: 0.95rem;
      background-color: #121c33 !important;
      color: #ffffff !important;
      transition: border-color var(--transition-speed), box-shadow var(--transition-speed);
    }

    .analysis-form .form-field input:focus, .analysis-form .form-field select:focus {
      outline: none;
      border-color: var(--primary-color) !important;
      box-shadow: 0 0 0 1px var(--primary-color) !important;
    }

    .analysis-form .form-field select {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23a78bfa' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 16px 12px;
      padding-right: 2.5rem;
    }

    .analysis-form button[type="submit"] {
      display: block;
      width: 100%;
      padding: 0.9rem 1.5rem;
      font-size: 1.1rem;
      font-weight: 800;
      color: #ffffff;
      background-color: var(--primary-color) !important;
      border: none;
      border-radius: 0.75rem;
      cursor: pointer;
      transition: background-color var(--transition-speed), transform 0.1s;
      box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
    }

    .analysis-form button[type="submit"]:hover:not(:disabled) {
      background-color: var(--primary-hover-color) !important;
      transform: translateY(-2px);
    }

    .analysis-form button[type="submit"]:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error-text {
      color: #f87171;
      font-size: 0.8rem;
      margin-top: 0.4rem;
    }

    .currency-equivalent {
      display: block;
      margin-top: 0.4rem;
      font-size: 0.8rem;
      color: #a78bfa;
      font-weight: 600;
    }

    .report-header {
      padding: 1.5rem 2rem;
      border-radius: 0.75rem;
      color: white;
      text-align: center;
      margin-bottom: 2rem;
    }

    .report-header.risk-bg-bajo { background: linear-gradient(135deg, #059669, #10b981); }
    .report-header.risk-bg-medio { background: linear-gradient(135deg, #d97706, #f59e0b); color: #ffffff; }
    .report-header.risk-bg-alto { background: linear-gradient(135deg, #dc2626, #ef4444); }

    .report-header .risk-category {
      font-size: 2.25rem;
      font-weight: 900;
      margin: 0;
      text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
    }

    .report-header .risk-confidence {
      font-size: 1.1rem;
      opacity: 0.95;
      display: inline-flex;
      margin: 0.25rem 0 0;
      font-weight: 600;
    }

    .critical-alert {
      border: 1px solid rgba(239, 68, 68, 0.4);
      background-color: rgba(239, 68, 68, 0.1);
      padding: 1.25rem;
      border-radius: 0.75rem;
      margin-bottom: 2rem;
    }

    .critical-alert h3 {
      margin-top: 0;
      margin-bottom: 0.75rem;
      color: #f87171 !important;
      border: none;
      padding: 0;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
    }

    .critical-alert p {
      margin-bottom: 0.5rem;
      line-height: 1.6;
      color: #fca5a5;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      background-color: #121c33 !important;
      border: 1px solid #1e293b !important;
      padding: 1.25rem;
      border-radius: 0.75rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .summary-card .summary-label {
      font-size: 0.8rem;
      color: #94a3b8;
      display: inline-flex;
      justify-content: center;
      font-weight: 600;
      text-transform: uppercase;
    }

    .summary-card .summary-value {
      font-size: 1.6rem;
      font-weight: 800;
      color: #ffffff !important;
    }

    .summary-card .summary-value.pace.positive { color: #10b981 !important; }
    .summary-card .summary-value.pace.negative { color: #ef4444 !important; }

    .progress-section {
      margin-bottom: 2rem;
    }

    .progress-section h4 {
      font-size: 0.95rem;
      color: #cbd5e1;
      margin-bottom: 0.75rem;
      font-weight: 700;
      text-align: left;
    }

    .progress-section .progress-bar-wrapper {
      background-color: #121c33;
      border: 1px solid #1e293b;
      border-radius: 2rem;
      height: 1.5rem;
      overflow: hidden;
    }

    .progress-section .progress-bar {
      height: 100%;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.85rem;
      transition: width 0.6s ease-in-out;
    }

    .progress-section .progress-bar.funding-bar {
      background: linear-gradient(90deg, #7c3aed, #3b82f6);
    }
    .progress-section .progress-bar.time-bar {
      background: linear-gradient(90deg, #475569, #64748b);
    }

    .timeline-details {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .timeline-point {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-grow: 1;
    }

    .timeline-point .timeline-label {
      font-size: 0.8rem;
      color: #94a3b8;
    }
    .timeline-point .timeline-date {
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
    }

    .factors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .factor-card {
      background-color: #121c33 !important;
      border: 1px solid #1e293b !important;
      border-left: 4px solid !important;
      border-radius: 0.75rem;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .factor-card.border-positivo { border-left-color: #10b981 !important; }
    .factor-card.border-neutral { border-left-color: #f59e0b !important; }
    .factor-card.border-negativo { border-left-color: #ef4444 !important; }

    .factor-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .factor-name {
      font-size: 1.05rem;
      font-weight: 800;
      color: #ffffff !important;
      margin: 0;
    }

    .assessment-badge {
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.2rem 0.6rem;
      border-radius: 1rem;
      color: white;
      text-transform: uppercase;
    }

    .assessment-badge.positivo { background-color: #10b981; }
    .assessment-badge.neutral { background-color: #f59e0b; color: #ffffff; }
    .assessment-badge.negativo { background-color: #ef4444; }

    .factor-value {
      font-size: 1.6rem;
      font-weight: 800;
      color: #a78bfa !important;
      margin: 0;
    }

    .importance-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #94a3b8;
      background-color: #0d1527;
      padding: 0.25rem 0.6rem;
      border-radius: 0.5rem;
      align-self: flex-start;
      border: 1px solid #1e293b;
    }

    .factor-description {
      font-size: 0.85rem;
      color: #94a3b8;
      line-height: 1.5;
      margin: 0.4rem 0 0;
    }

    .financial-details-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      margin-top: 2rem;
    }

    .projections-card, .risk-composition-card {
      background-color: #121c33 !important;
      border: 1px solid #1e293b !important;
      padding: 1.5rem;
      border-radius: 0.75rem;
    }

    .projections-card h3, .risk-composition-card h3 {
      margin-top: 0;
      border: none;
      padding-left: 0;
    }

    .chart-description {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: -0.25rem 0 1rem 0;
      line-height: 1.5;
      text-align: center;
    }

    .tooltip-container {
      position: relative;
      display: inline-block;
      margin-left: 0.5rem;
      line-height: 1;
    }

    .tooltip-container .info-icon {
      color: #a78bfa;
      cursor: help;
      font-size: 1rem;
    }

    .tooltip-container .tooltip {
      visibility: hidden;
      width: 280px;
      background-color: #0d1527;
      color: #f8fafc;
      text-align: left;
      border-radius: 0.75rem;
      padding: 1rem;
      position: absolute;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.3s;
      font-size: 0.85rem;
      line-height: 1.5;
      border: 1px solid #1e293b;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.8);
      font-weight: normal;
    }

    .tooltip-container .tooltip.large {
      width: 350px;
    }

    .tooltip-container .tooltip strong {
      color: #a78bfa;
    }

    .tooltip-container .tooltip.tooltip-bottom {
      top: 150%;
      left: 50%;
      transform: translateX(-50%);
    }

    .tooltip-container:hover .tooltip {
      visibility: visible;
      opacity: 1;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }

    table th, table td {
      padding: 0.85rem 1rem;
      text-align: left;
      border-bottom: 1px solid #1e293b;
    }

    table thead th {
      background-color: #0d1527 !important;
      font-weight: 700;
      color: #ffffff !important;
      font-size: 0.85rem;
      text-transform: uppercase;
    }

    table tbody tr {
      background-color: transparent !important;
    }

    table tbody tr:hover {
      background-color: rgba(124, 58, 237, 0.15) !important;
    }

    table strong {
      color: #10b981;
      font-size: 1.05rem;
      font-weight: 800;
    }

    .loading-spinner-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(13, 21, 39, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      backdrop-filter: blur(8px);
    }

    .spinner {
      border: 4px solid #1e293b;
      border-top: 4px solid #7c3aed;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      text-align: center;
      padding: 1.5rem;
      margin-top: 2rem;
      border-radius: 0.75rem;
      background-color: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.4);
      font-weight: 600;
    }

    .chart-container {
      height: 400px;
      margin-top: 1rem;
    }

    :host ::ng-deep .ngx-charts.advanced-pie-chart .total-value {
      color: #ffffff !important;
      fill: #ffffff !important;
      font-size: 2.25rem !important;
      font-weight: 900 !important;
    }
    :host ::ng-deep .ngx-charts.advanced-pie-chart .total-label {
      color: #94a3b8 !important;
      fill: #94a3b8 !important;
      font-size: 0.85rem !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
    }
    :host ::ng-deep .ngx-charts.advanced-pie-chart .advanced-pie-legend {
      color: #f8fafc !important;
      background: transparent !important;
    }
    :host ::ng-deep .ngx-charts.advanced-pie-chart .advanced-pie-legend .legend-item {
      margin: 0 0.5rem !important;
    }
    :host ::ng-deep .ngx-charts.advanced-pie-chart .advanced-pie-legend .legend-item .item-value {
      color: #ffffff !important;
      fill: #ffffff !important;
      font-size: 1.2rem !important;
      font-weight: 800 !important;
    }
    :host ::ng-deep .ngx-charts.advanced-pie-chart .advanced-pie-legend .legend-item .item-label {
      color: #94a3b8 !important;
      fill: #94a3b8 !important;
      font-size: 0.85rem !important;
      font-weight: 600 !important;
    }
    :host ::ng-deep .ngx-charts.advanced-pie-chart .advanced-pie-legend .legend-item .item-percent {
      color: #a78bfa !important;
      fill: #a78bfa !important;
      font-size: 1.05rem !important;
      font-weight: 800 !important;
    }
    :host ::ng-deep .ngx-charts text, :host ::ng-deep .ngx-charts span, :host ::ng-deep .ngx-charts div {
      font-family: inherit !important;
    }
    :host ::ng-deep .ngx-charts .axis-label, :host ::ng-deep .ngx-charts .tick-label {
      fill: #94a3b8 !important;
      font-size: 0.85rem !important;
    }
  `]
})
export class RiskAnalysisPageComponent implements OnInit, OnDestroy {
  private analysisService = inject(AnalysisService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private toast = inject(MessageService);
  private destroy$ = new Subject<void>();

  analysisResult = signal<RiskAnalysisResponse | null>(null);
  isLoading = signal(false);
  usdEquivalent = signal<number | null>(null);
  errorMessage = signal<string | null>(null);

  criticalAlert = signal<{
    riskCategory: 'Alto' | 'Medio';
    criticalFactor: AnalysisFactor;
    article: string;
    explanation: string;
  } | null>(null);

  colorScheme: Color = {
    name: 'riskScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#10b981', '#f59e0b', '#ef4444', '#7c3aed', '#3b82f6', '#ec4899']
  };

  analysisForm: FormGroup;

  constructor() {
    this.analysisForm = this.fb.group({
      projectId: [null, Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      currency: ['USD', Validators.required],
      profit1Year: [0, [Validators.required, Validators.min(0), Validators.max(99)]],
      profit2Years: [0, [Validators.required, Validators.min(0), Validators.max(99)]],
      profit3Years: [0, [Validators.required, Validators.min(0), Validators.max(99)]]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const projectId = params.get('id');
      if (projectId) {
        this.analysisForm.patchValue({ projectId: +projectId });
      }
    });

    this.analysisForm.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged((prev, curr) => prev.amount === curr.amount && prev.currency === curr.currency),
      takeUntil(this.destroy$),
      switchMap((formValue: RiskAnalysisRequest) => {
        if (formValue.currency !== 'USD' && formValue.amount > 0) {
          return this.analysisService.convertCurrency(formValue.currency, 'USD', formValue.amount);
        } else {
          this.usdEquivalent.set(null);
          return of(null);
        }
      })
    ).subscribe((response: CurrencyConversionResponse | null) => {
      if (response) {
        this.usdEquivalent.set(response.convertedAmount);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get projectId(): AbstractControl { return this.analysisForm.get('projectId')!; }
  get amount(): AbstractControl { return this.analysisForm.get('amount')!; }
  get currency(): AbstractControl { return this.analysisForm.get('currency')!; }
  get profit1Year(): AbstractControl { return this.analysisForm.get('profit1Year')!; }
  get profit2Years(): AbstractControl { return this.analysisForm.get('profit2Years')!; }
  get profit3Years(): AbstractControl { return this.analysisForm.get('profit3Years')!; }

  onSubmit(): void {
    if (this.analysisForm.invalid) {
      this.analysisForm.markAllAsTouched();
      this.toast.add({ severity: 'warn', summary: 'Validation', detail: 'Please complete all required fields correctly.' });
      return;
    }

    this.isLoading.set(true);
    this.analysisResult.set(null);
    this.criticalAlert.set(null);
    this.errorMessage.set(null);

    const requestData: RiskAnalysisRequest = this.analysisForm.value;

    this.analysisService.getRiskAnalysis(requestData).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response: RiskAnalysisResponse) => {
        if (response.riskChartData) {
          response.riskChartData.forEach((item: { name: string }) => {
            item.name = item.name.replace('Riesgo por ', '');
          });
        }

        this.analysisResult.set(response);
        this.checkForCriticalAlert(response);

        setTimeout(() => {
          document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      },
      error: (err: HttpErrorResponse) => {
        const msg = err.error?.message || err.error || 'An unexpected error occurred while contacting the server.';
        this.errorMessage.set(msg);
        this.toast.add({ severity: 'error', summary: 'Analysis Error', detail: msg });
        console.error(err);
      }
    });
  }

  goBack(): void {
    window.history.back();
  }

  private checkForCriticalAlert(result: RiskAnalysisResponse): void {
    if (result.riskCategory === 'Alto' || result.riskCategory === 'Medio') {
      const mostImportantNegativeFactor = result.analysisFactors
        .filter(factor => factor.factorAssessment === 'Negativo')
        .sort((a, b) => b.importancePercentage - a.importancePercentage)[0];

      if (mostImportantNegativeFactor) {
        this.criticalAlert.set({
          riskCategory: result.riskCategory as 'Alto' | 'Medio',
          criticalFactor: mostImportantNegativeFactor,
          ...this.getCriticalFactorExplanation(mostImportantNegativeFactor)
        });
      }
    }
  }

  private getCriticalFactorExplanation(factor: AnalysisFactor): { article: string, explanation: string } {
    const lowerCaseName = factor.factorName.toLowerCase();
    const article = (lowerCaseName.endsWith('a') || lowerCaseName.endsWith('ión')) ? 'la' : 'el';
    let adjective = '';

    switch (factor.factorName) {
      case 'Dependencia de tu Inversión':
        adjective = 'demasiado alta';
        break;
      case 'Progreso del Proyecto':
        adjective = 'demasiado bajo';
        break;
      default:
        adjective = 'desfavorable';
        break;
    }

    return { article, explanation: adjective };
  }

  valueFormatting = (value: number): string => value.toLocaleString();
  percentageFormatting = (percentage: number): string => `${percentage.toFixed(1)}%`;

  onSelect(event: { name: string, value: number }): void {
    console.log('Item clicked', event);
  }
}
