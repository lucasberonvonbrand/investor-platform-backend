import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AnalysisService, RiskAnalysisRequest, RiskAnalysisResponse, CurrencyConversionResponse, AnalysisFactor } from '../../core/services/analysis.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, takeUntil, finalize } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-risk-analysis',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxChartsModule,
    ToolbarModule,
    ButtonModule
  ],
  templateUrl: './risk-analysis.component.html',
  styleUrls: ['./risk-analysis.component.scss']
})
export class RiskAnalysisComponent implements OnInit, OnDestroy {

  analysisResult: RiskAnalysisResponse | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  usdEquivalent: number | null = null;
  private destroy$ = new Subject<void>();

  // Propiedad para la nueva alerta crítica
  criticalAlert: {
    riskCategory: 'Alto' | 'Medio';
    criticalFactor: AnalysisFactor;
    article: string;
    explanation: string;
  } | null = null;

  // Esquema de colores para los gráficos
  colorScheme: Color = {
    name: 'riskScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#28a745', '#ffc107', '#dc3545', '#007bff', '#6f42c1']
  };

  analysisForm: FormGroup;

  // Inyección de dependencias moderna para componentes Standalone
  private analysisService: AnalysisService = inject(AnalysisService);
  private fb: FormBuilder = inject(FormBuilder);
  private route: ActivatedRoute = inject(ActivatedRoute);

  constructor() {
    this.analysisForm = this.fb.group({
      projectId: [null, Validators.required], // Se llenará desde la URL
      amount: [0, [Validators.required, Validators.min(1)]], // El monto debe ser mayor a 0
      currency: ['USD', Validators.required],
      profit1Year: [0, [Validators.required, Validators.min(0), Validators.max(99)]],
      profit2Years: [0, [Validators.required, Validators.min(0), Validators.max(99)]],
      profit3Years: [0, [Validators.required, Validators.min(0), Validators.max(99)]]
    });
  }

  ngOnInit(): void {
    // 1. Obtener el projectId de la ruta y rellenar el formulario
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const projectId = params.get('projectId');
      if (projectId) {
        this.analysisForm.patchValue({ projectId: +projectId });
      }
    });

    // 2. Escuchar cambios para la conversión de moneda
    this.analysisForm.valueChanges.pipe(
      debounceTime(400), // Espera 400ms después de la última pulsación
      distinctUntilChanged((prev, curr) => prev.amount === curr.amount && prev.currency === curr.currency),
      takeUntil(this.destroy$),
      switchMap((formValue: RiskAnalysisRequest) => {
        if (formValue.currency !== 'USD' && formValue.amount > 0) {
          return this.analysisService.convertCurrency(formValue.currency, 'USD', formValue.amount);
        } else {
          // Si la moneda es USD o el monto es 0, resetea el equivalente
          this.usdEquivalent = null;
          return of(null);
        }
      })
    ).subscribe((response: CurrencyConversionResponse | null) => {
      if (response) {
        this.usdEquivalent = response.convertedAmount;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Getters para un acceso más fácil desde el template
  get projectId(): AbstractControl | null { return this.analysisForm.get('projectId'); }
  get amount(): AbstractControl | null { return this.analysisForm.get('amount'); }
  get currency(): AbstractControl | null { return this.analysisForm.get('currency'); }
  get profit1Year(): AbstractControl | null { return this.analysisForm.get('profit1Year'); }
  get profit2Years(): AbstractControl | null { return this.analysisForm.get('profit2Years'); }
  get profit3Years(): AbstractControl | null { return this.analysisForm.get('profit3Years'); }

  onSubmit(): void {
    // Añadimos una clase al body para oscurecerlo mientras carga
    document.body.classList.add('is-loading');

    if (this.analysisForm.invalid) {
      this.analysisForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.analysisResult = null;
    this.criticalAlert = null; // Reseteamos la alerta
    this.errorMessage = null;

    const requestData: RiskAnalysisRequest = this.analysisForm.value;

    this.analysisService.getRiskAnalysis(requestData).pipe(
      finalize(() => {
        this.isLoading = false;
        document.body.classList.remove('is-loading'); // Quitamos la clase al finalizar
      })
    ).subscribe({
      next: (response: RiskAnalysisResponse) => {
        // Acortamos las etiquetas del gráfico para mejor visualización
        if (response.riskChartData) {
          response.riskChartData.forEach((item: { name: string }) => {
            item.name = item.name.replace('Riesgo por ', '');
          });
        }

        this.analysisResult = response;
        this.checkForCriticalAlert(response); // Verificamos si hay que mostrar la alerta

        // Scroll suave a los resultados después de que se rendericen
        setTimeout(() => {
          document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      },
      error: (err: HttpErrorResponse) => {
        // Manejo de errores mejorado para capturar BusinessException del backend
        this.errorMessage = err.error?.message || err.error || 'Ocurrió un error inesperado al contactar el servidor.';
        console.error(err);
      }
    });
  }

  goBack(): void {
    window.history.back();
  }

  /**
   * Revisa el resultado del análisis para determinar si se debe mostrar una alerta crítica.
   */
  private checkForCriticalAlert(result: RiskAnalysisResponse): void {
    if (result.riskCategory === 'Alto' || result.riskCategory === 'Medio') {
      // Encontrar el factor negativo con la mayor importancia
      const mostImportantNegativeFactor = result.analysisFactors
        .filter(factor => factor.factorAssessment === 'Negativo')
        .sort((a, b) => b.importancePercentage - a.importancePercentage)[0]; // El [0] toma el más importante

      if (mostImportantNegativeFactor) {
        this.criticalAlert = {
          riskCategory: result.riskCategory,
          criticalFactor: mostImportantNegativeFactor,
          ...this.getCriticalFactorExplanation(mostImportantNegativeFactor)
        };
      }
    }
  }

  /**
   * Genera la explicación correcta (artículo y adjetivo) para un factor crítico.
   */
  private getCriticalFactorExplanation(factor: AnalysisFactor): { article: string, explanation: string } {
    const lowerCaseName = factor.factorName.toLowerCase();
    const article = (lowerCaseName.endsWith('a') || lowerCaseName.endsWith('ión')) ? 'la' : 'el';
    let adjective = '';

    // Lógica específica para cada factor cuando es negativo
    switch (factor.factorName) {
      case 'Dependencia de tu Inversión':
        adjective = 'demasiado alta';
        break;
      case 'Progreso del Proyecto':
        adjective = 'demasiado bajo';
        break;
      // Añadir otros casos si es necesario
      default:
        // Fallback genérico
        adjective = 'desfavorable';
        break;
    }

    return { article, explanation: adjective };
  }

  // --- NUEVAS FUNCIONES PARA EL GRÁFICO ---

  /**
   * Formatea el valor absoluto que se muestra en la leyenda del gráfico.
   */
  valueFormatting = (value: number): string => {
    // Muestra el número con separadores de miles (ej: 1,234)
    return value.toLocaleString();
  }

  /**
   * Formatea el porcentaje que se muestra en la leyenda del gráfico.
   */
  percentageFormatting = (percentage: number): string => {
    // Muestra el porcentaje con un decimal (ej: 25.5%)
    return `${percentage.toFixed(1)}%`;
  }

  onSelect(event: { name: string, value: number }): void {
    console.log('Item clicked', event);
  }
}
