import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';

import { InvestmentsService, IInvestedProject } from '../../../core/services/investments.service';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { UIChart, ChartModule } from 'primeng/chart';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-investment-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, TagModule, ToolbarModule, ToastModule, ChartModule],
  providers: [MessageService],
  templateUrl: './investment-detail.component.html',
  styleUrls: ['./investment-detail.component.scss']
})
export class InvestmentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private investmentsSvc = inject(InvestmentsService);
  private toast = inject(MessageService);

  investment = signal<IInvestedProject | null>(null);
  loading = signal(true);

  // --- Control del Gráfico ---
  @ViewChild('chartCanvas') chartComponent?: UIChart;

  // --- Chart Data & Options ---
  chartData = signal<any>({});
  chartOptions = signal<any>({});

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('investmentId'));
        if (!id) {
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'ID de inversión no válido.' });
          this.router.navigate(['/mis-inversiones']);
          return [];
        }
        this.loading.set(true);
        return this.investmentsSvc.getInvestmentById(id);
      })
    ).subscribe({
      next: (data) => {
        this.investment.set(data);
        // Usamos setTimeout para asegurar que la vista se actualice ANTES de intentar dibujar el gráfico
        setTimeout(() => this.setupChart(), 0);
        this.loading.set(false); // Datos cargados, quitamos el spinner
      },
      error: (err) => {
        console.error('Error loading investment detail:', err);
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el detalle de la inversión.' });
        this.loading.set(false);
      }
    });
  }

  private setupChart(): void {
    const inv = this.investment();
    if (!inv || !this.chartComponent) return; // Doble chequeo por si acaso

    const data = [
      this.calculateProfit(inv.amount, inv.profit1Year),
      this.calculateProfit(inv.amount, inv.profit2Years),
      this.calculateProfit(inv.amount, inv.profit3Years)
    ];

    const documentStyle = getComputedStyle(document.documentElement);

    // El gradiente debe crearse aquí, donde se usa.
    const canvas = this.chartComponent.getCanvas();
    const gradient = canvas.getContext('2d')!.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    // Se mueven las opciones aquí para asegurar que los colores del tema se carguen correctamente
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');
    this.chartOptions.set({
      maintainAspectRatio: false,
      aspectRatio: 0.9,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => `Ganancia: ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: inv.currency }).format(context.raw)}`
          }
        }
      },
      scales: {
        y: {
          ticks: {
            color: textColorSecondary,
            callback: (value: any) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: inv.currency, minimumFractionDigits: 0 }).format(value)
          },
          grid: { color: surfaceBorder }
        },
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder }
        }
      }
    });

    this.chartData.set({
      labels: ['1 Año', '2 Años', '3 Años'],
      datasets: [{
        label: 'Ganancia Estimada',
        fill: true,
        data: data,
        borderColor: documentStyle.getPropertyValue('--p-blue-500'),
        backgroundColor: gradient,
        tension: 0.4,
        pointBackgroundColor: documentStyle.getPropertyValue('--p-blue-500'),
        pointBorderColor: documentStyle.getPropertyValue('--p-blue-500'),
      }]
    });

    this.chartComponent.reinit(); // Forzamos el redibujado con los nuevos datos y opciones
  }

  goBack(): void {
    this.router.navigate(['/mis-inversiones']);
  }

  goToProject(): void {
    const projectId = this.investment()?.project.id;
    if (projectId) {
      this.router.navigate(['/proyectos-maestro', projectId]);
    }
  }

  getInvestmentStatusLabel(status: string | null): string {
    // Puedes expandir esto si tienes más estados
    switch (status) {
      case 'IN_PROGRESS': return 'En Progreso';
      case 'RECEIVED': return 'Recibida';
      case 'NOT_RECEIVED': return 'No Recibida';
      default: return status || 'Desconocido';
    }
  }

  calculateProfit(baseAmount: number | null | undefined, percentage: number | null | undefined): number {
    if (baseAmount == null || percentage == null || percentage < 0) {
      return 0;
    }
    return (baseAmount * percentage); // El backend ya devuelve el porcentaje como fracción (ej: 0.10 para 10%)
  }

  // --- Copied from my-investments-panel for style consistency ---
  private readonly tagPalette: Array<{bg: string; fg: string}> = [
    { bg: '#22c55e', fg: '#ffffff' },
    { bg: '#3b82f6', fg: '#ffffff' },
    { bg: '#f59e0b', fg: '#111111' },
    { bg: '#ef4444', fg: '#ffffff' },
    { bg: '#a855f7', fg: '#ffffff' },
    { bg: '#14b8a6', fg: '#ffffff' },
    { bg: '#06b6d4', fg: '#111111' },
  ];
  private hashKey(name: string): number {
    let h=0; for (let i=0;i<(name||'').length;i++) h=(h*31+name.charCodeAt(i))>>>0; return h;
  }
  tagStyle(text: string, index: number) {
    const key = text ?? String(index);
    const c = this.tagPalette[this.hashKey(key) % this.tagPalette.length];
    return { 'background-color': c.bg, color: c.fg, 'border-color': 'transparent', 'border-radius': '8px', 'font-weight': 700, 'padding': '0 .5rem' };
  }
}