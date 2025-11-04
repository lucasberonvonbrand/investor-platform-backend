import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ProjectsService, IProject } from '../../../core/services/projects.service';
import { AuthService } from '../../auth/login/auth.service';
@Component({
  standalone: true,
  selector: 'app-projects-panel',
  imports: [
    CommonModule, FormsModule,
    CardModule, ToolbarModule, ButtonModule, InputTextModule,
    TagModule, TableModule, DialogModule, DividerModule, TooltipModule, ToastModule
  ],
  templateUrl: './projects-panel.component.html',
  styleUrls: ['./projects-panel.component.scss'],
  providers: [MessageService]
})
export class ProjectsPanelComponent implements OnInit {
  private svc = inject(ProjectsService);
  private toast = inject(MessageService);
  private router = inject(Router);
  private auth = inject(AuthService);

  // filtros
  q = '';

  // datos
  projects: IProject[] = [];
  filtered: IProject[] = [];

  // vista
  viewMode: 'cards' | 'table' = 'cards';

  // detalle
  showDetail = false;
  selected: IProject | null = null;

  // loading
  loading = false;

  // KPIs
  kpis = { total: 0, activos: 0, recientes: 0, conFinanciacion: 0 };

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.svc.getAll().subscribe({
      next: (list) => {
        this.projects = (list || []).map(p => ({
          ...p,
          category: p.category ?? '—',
          status: p.status ?? 'IN_PROGRESS'
        }));
        this.applyFilters();
        this.computeKpis();
      },
      error: (err) => {
        console.error(err);
        this.toast.add({ severity: 'error', summary: 'Proyectos', detail: 'No se pudieron cargar' });
      },
      complete: () => (this.loading = false)
    });
  }

  applyFilters(): void {
    const q = (this.q || '').toLowerCase().trim();

    this.filtered = this.projects.filter(p => {
      const matchesQ =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.summary?.toLowerCase().includes(q) ||
        p.university?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q);
      return matchesQ;
    });
  }

  computeKpis(): void {
    const now = Date.now(), recentMs = 30*24*60*60*1000;
    this.kpis.total = this.projects.length;
    this.kpis.activos = this.projects.filter(p => (p.status||'') !== 'COMPLETED').length;
    this.kpis.recientes = this.projects.filter(p => {
      const t = p.lastUpdated ? Date.parse(p.lastUpdated) : 0;
      return t && (now - t) <= recentMs;
    }).length;
    this.kpis.conFinanciacion = this.projects.filter(p => p.fundingGoal != null).length;
  }

  // UI
  openDetail(p: IProject) {
    if (!p?.id) return;
    const session = this.auth.getSession();
    if (session?.roles.includes('ROLE_INVESTOR')) {
      this.router.navigate(['/proyectos-maestro', p.id]);
    } else {
      this.selected = p; this.showDetail = true;
    }
  }

  getProjectStatusLabel(status: string | null | undefined): string {
    switch (status) {
      case 'IN_PROGRESS': return 'En Progreso';
      case 'PENDING_FUNDING': return 'Pendiente de Financiación';
      case 'COMPLETED': return 'Completado';
      case 'CANCELLED': return 'Cancelado';
      case 'IDEA': return 'Idea';
      case 'MVP': return 'MVP';
      case 'FUNDING': return 'En Financiación';
      default: return status || 'No definido';
    }
  }

  getCategoryLabel(category: string | null | undefined): string {
    return !category || category === '—' ? 'Sin categoría' : category;
  }

  // tags colores
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
