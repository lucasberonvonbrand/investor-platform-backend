import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';

import { InvestmentsService, IInvestedProject } from '../../../core/services/investments.service';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-investment-detail',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule, ToolbarModule, ToastModule],
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
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading investment detail:', err);
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el detalle de la inversión.' });
        this.loading.set(false);
      }
    });
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
      case 'COMPLETED': return 'Completada';
      case 'CANCELLED': return 'Cancelada';
      default: return status || 'Desconocido';
    }
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