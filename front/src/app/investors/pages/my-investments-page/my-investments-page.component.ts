import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { InvestmentsService, IInvestedProject } from '../../services/investments.service';
import { IMyProject } from '../../../projects/services/my-projects.service';

@Component({
  selector: 'app-my-investments-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CardModule, ToolbarModule, ButtonModule, InputTextModule,
    TagModule, TableModule, TooltipModule, ToastModule
  ],
  templateUrl: './my-investments-page.component.html',
  providers: [MessageService]
})
export class MyInvestmentsPageComponent implements OnInit {
  private svc = inject(InvestmentsService);
  private toast = inject(MessageService);
  private router = inject(Router);

  // state
  q = signal('');
  viewMode = signal<'cards' | 'table'>('cards');
  loading = signal(false);

  investments = signal<IInvestedProject[]>([]);
  
  // computed
  filtered = computed(() => {
    const query = this.q().toLowerCase().trim();
    if (!query) return this.investments();
    
    return this.investments().filter(inv => 
      inv.project.title?.toLowerCase().includes(query) ||
      inv.project.summary?.toLowerCase().includes(query) ||
      inv.project.university?.toLowerCase().includes(query) ||
      inv.project.category?.toLowerCase().includes(query)
    );
  });

  recommended = computed(() => {
    const base = this.filtered().length ? this.filtered() : this.investments();
    const scored = base.map(inv => {
      let s = 0;
      if ((inv.project.status || '') !== 'COMPLETED') s += 2;
      if (inv.project.lastUpdated) {
        const days = (Date.now() - Date.parse(inv.project.lastUpdated)) / (1000 * 60 * 60 * 24);
        if (!Number.isNaN(days)) s += Math.max(0, 10 - Math.min(10, Math.floor(days / 7)));
      }
      if (inv.project.fundingGoal != null) s += 3;
      if (inv.project.fundingRaised != null) s += 2;
      return { p: inv.project, s };
    });

    return scored.sort((a, b) => b.s - a.s).slice(0, 6).map(x => x.p);
  });

  kpis = computed(() => {
    const invs = this.investments();
    const totalAmount = invs.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const activeCount = invs.filter(inv => ['RECEIVED', 'COMPLETED', 'IN_PROGRESS'].includes(inv.status || '')).length;
    const pendingCount = invs.filter(inv => ['PENDING_CONFIRMATION', 'DRAFT', 'PENDING_STUDENT_SIGNATURE'].includes(inv.status || '')).length;
    
    return {
      totalAmount,
      totalCount: invs.length,
      activeCount,
      pendingCount
    };
  });

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.svc.getMyInvestedProjects().subscribe({
      next: (list) => {
        this.investments.set(list || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load your investments' });
        this.loading.set(false);
      }
    });
  }

  openDetail(inv: IInvestedProject) {
    if (!inv?.idInvestment) return;
    this.router.navigate(['/investors/investments', inv.idInvestment]);
  }

  getInvestmentStatusLabel(status: string | null | undefined): string {
    switch (status) {
      case 'IN_PROGRESS': return 'En Proceso';
      case 'PENDING_CONFIRMATION': return 'Pendiente Confirmación';
      case 'RECEIVED': return 'Recibido';
      case 'COMPLETED': return 'Completado';
      case 'NOT_RECEIVED': return 'No Recibido';
      case 'CANCELLED': return 'Cancelado';
      case 'PENDING_RETURN': return 'Pendiente Devolución';
      case 'RETURNED': return 'Devuelto';
      default: return status || 'Sin Definir';
    }
  }

  getInvestmentStatusSeverity(status: string | null | undefined): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'IN_PROGRESS': return 'info';
      case 'PENDING_CONFIRMATION': return 'warn';
      case 'RECEIVED': return 'success';
      case 'COMPLETED': return 'success';
      case 'NOT_RECEIVED': return 'danger';
      case 'CANCELLED': return 'danger';
      case 'PENDING_RETURN': return 'warn';
      case 'RETURNED': return 'success';
      default: return 'info';
    }
  }

  tagStyle(text: string, index: number) {
    const palette = [
      { bg: '#22c55e', fg: '#ffffff' },
      { bg: '#3b82f6', fg: '#ffffff' },
      { bg: '#f59e0b', fg: '#111111' },
      { bg: '#ef4444', fg: '#ffffff' },
      { bg: '#a855f7', fg: '#ffffff' },
      { bg: '#14b8a6', fg: '#ffffff' },
      { bg: '#06b6d4', fg: '#111111' },
    ];
    let h = 0; 
    for (let i = 0; i < (text || '').length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0; 
    const c = palette[h % palette.length];
    return { 'background-color': c.bg, color: c.fg, 'border-color': 'transparent', 'border-radius': '8px', 'font-weight': 600, 'padding': '0 .5rem' };
  }
}
