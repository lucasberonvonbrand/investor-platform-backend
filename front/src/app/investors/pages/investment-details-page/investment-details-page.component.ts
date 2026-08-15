import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';

import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ChartModule } from 'primeng/chart';
import { ToastModule } from 'primeng/toast';
import { InvestmentsService, IInvestedProject } from '../../services/investments.service';
import { IInvestment, IEarning } from '../../../projects/services/project-details.service';

@Component({
  selector: 'app-investment-details-page',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    CardModule, ProgressBarModule, TagModule, ButtonModule, TableModule, TooltipModule, ToastModule, ChartModule
  ],
  templateUrl: './investment-details-page.component.html',
  providers: [MessageService]
})
export class InvestmentDetailsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private investmentsSvc = inject(InvestmentsService);
  private toast = inject(MessageService);

  investment = signal<IInvestedProject | null>(null);
  loading = signal<boolean>(true);

  fundingProgress = computed(() => {
    const p = this.investment()?.project;
    if (!p || !p.fundingGoal || p.fundingGoal <= 0 || !p.fundingRaised) {
      return 0;
    }
    return Math.min(100, (p.fundingRaised / p.fundingGoal) * 100);
  });

  projectionChartData = computed(() => {
    const inv = this.investment();
    if (!inv || !inv.amount) return null;

    const normalizeRate = (rate: number | null | undefined, defaultPct: number) => {
      if (rate == null || rate <= 0) return defaultPct;
      return rate <= 1 ? rate * 100 : rate;
    };

    const p1 = normalizeRate(inv.profit1Year, 12);
    const p2 = normalizeRate(inv.profit2Years, 18);
    const p3 = normalizeRate(inv.profit3Years, 25);

    const projections = [
      { label: 'Año 1', rate: p1 },
      { label: 'Año 2', rate: p2 },
      { label: 'Año 3', rate: p3 },
    ];

    return {
      labels: projections.map(p => p.label),
      datasets: [
        {
          label: 'Ganancia Proyectada',
          data: projections.map(p => inv.amount * (p.rate / 100)),
          fill: true,
          borderColor: '#7c3aed',
          backgroundColor: 'rgba(124, 58, 237, 0.18)',
          tension: 0.4,
          pointRadius: 6,
          pointBackgroundColor: '#a78bfa',
          pointBorderColor: '#7c3aed'
        }
      ],
      projectionsList: projections.map(p => ({
        label: p.label,
        rate: p.rate,
        profit: inv.amount * (p.rate / 100)
      }))
    };
  });

  scheduledEarnings = computed(() => {
    const inv = this.investment();
    if (!inv) return [];

    const baseDate = inv.createdAt ? new Date(inv.createdAt) : new Date();

    const normalizeRate = (rate: number | null | undefined, defaultPct: number) => {
      if (rate == null || rate <= 0) return defaultPct;
      return rate <= 1 ? rate * 100 : rate;
    };

    const rates = [
      { year: 1, rate: normalizeRate(inv.profit1Year, 12) },
      { year: 2, rate: normalizeRate(inv.profit2Years, 18) },
      { year: 3, rate: normalizeRate(inv.profit3Years, 25) }
    ];

    return rates.map(r => {
      const scheduledDate = new Date(baseDate);
      scheduledDate.setFullYear(scheduledDate.getFullYear() + r.year);
      return {
        year: r.year,
        rate: r.rate,
        amount: inv.amount * (r.rate / 100),
        currency: inv.currency || 'USD',
        date: scheduledDate
      };
    });
  });

  projectionChartOptions = computed(() => {
    const inv = this.investment();
    if (!inv) return {};

    const currency = inv.currency || 'USD';

    return {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => ` +${context.formattedValue} ${currency}`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8', font: { weight: 'bold' } },
          grid: { color: '#1e293b' }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#94a3b8',
            callback: (value: number) => `${value.toLocaleString()} ${currency}`
          },
          grid: { color: '#1e293b' }
        }
      }
    };
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('investmentId');
    if (id) {
      this.loadInvestment(Number(id));
    } else {
      this.toast.add({ severity: 'error', summary: 'Error', detail: 'No investment ID provided.' });
      this.loading.set(false);
    }
  }

  private loadInvestment(id: number): void {
    this.loading.set(true);
    this.investmentsSvc.getInvestmentById(id).subscribe({
      next: (data) => {
        if (data) {
          this.investment.set(data);
        } else {
          this.toast.add({ severity: 'warn', summary: 'Not found', detail: 'Could not find the investment.' });
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load investment data.' });
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  getInvestmentStatusLabel(status: IInvestment['status'] | undefined | null): string {
    switch (status) {
      case 'IN_PROGRESS': return 'En Proceso';
      case 'PENDING_CONFIRMATION': return 'Pendiente Confirmación';
      case 'RECEIVED': return 'Recibido por Estudiante';
      case 'COMPLETED': return 'Completado';
      case 'NOT_RECEIVED': return 'No Recibido';
      case 'CANCELLED': return 'Cancelado';
      case 'PENDING_RETURN': return 'Pendiente Devolución';
      case 'RETURNED': return 'Devuelto';
      default: return 'Sin Definir';
    }
  }

  getInvestmentStatusSeverity(status: IInvestment['status'] | undefined | null): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'IN_PROGRESS': case 'PENDING_CONFIRMATION': return 'info';
      case 'RECEIVED': case 'COMPLETED': case 'RETURNED': return 'success';
      case 'CANCELLED': case 'NOT_RECEIVED': return 'danger';
      case 'PENDING_RETURN': return 'warn';
      default: return 'secondary';
    }
  }

  getEarningStatusLabel(status: IEarning['status'] | null): string {
    switch (status) {
      case 'IN_PROGRESS': return 'Envío Pendiente por Estudiante';
      case 'PENDING_CONFIRMATION': return 'Pendiente Confirmación Recepción';
      case 'RECEIVED': return 'Ganancia Recibida';
      case 'NOT_RECEIVED': return 'Marcado como No Recibido';
      default: return 'Sin Definir';
    }
  }

  getEarningStatusSeverity(status: IEarning['status'] | null): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'IN_PROGRESS': return 'info';
      case 'PENDING_CONFIRMATION': return 'warn';
      case 'RECEIVED': return 'success';
      case 'NOT_RECEIVED': return 'danger';
      default: return 'secondary';
    }
  }

  goBack(): void {
    window.history.back();
  }
}
