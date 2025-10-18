import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Angular forms

import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

import { InvestmentsService, IMyProject } from '../../../core/services/investments.service';

@Component({
  standalone: true,
  selector: 'app-my-investments-panel',
 imports: [
  CommonModule, FormsModule,
  CardModule, ToolbarModule, ButtonModule, InputTextModule,
  TagModule, TableModule, TooltipModule, ToastModule
],

  templateUrl: './my-investments-panel.component.html',
  styleUrls: ['./my-investments-panel.component.scss'],
  providers: [MessageService]
})
export class MyInvestmentsPanelComponent implements OnInit {
  private svc = inject(InvestmentsService);
  private toast = inject(MessageService);
  private router = inject(Router);

  // filtros
  q = '';
  selectedCategory = '';
  categories: string[] = [];

  // datos
  projects: IMyProject[] = [];
  filtered: IMyProject[] = [];
  recommended: IMyProject[] = [];

  // vista
  viewMode: 'cards' | 'table' = 'cards';

  // loading
  loading = false;

  // KPIs
  kpis = { total: 0, activos: 0, recientes: 0, conFinanciacion: 0 };

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.svc.getMyInvestedProjects().subscribe({
      next: (list) => {
        this.projects = (list || []).map(p => ({ ...p, category: p.category ?? '—', status: p.status ?? 'IN_PROGRESS' }));
        this.applyFilters();
        this.computeKpis();
        this.buildRecommended();
      },
      error: (err) => {
        console.error(err);
        this.toast.add({ severity: 'error', summary: 'Mis Inversiones', detail: 'No se pudieron cargar' });
      },
      complete: () => (this.loading = false)
    });
  }

  applyFilters(): void {
    const q = (this.q || '').toLowerCase().trim();
    const cat = (this.selectedCategory || '').toLowerCase();

    this.filtered = this.projects.filter(p => {
      const matchesQ =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.summary?.toLowerCase().includes(q) ||
        p.university?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q);
      const matchesCat = !cat || (p.category?.toLowerCase() === cat);
      return matchesQ && matchesCat;
    });

    const set = new Set<string>(this.projects.map(p => p.category ?? '—'));
    this.categories = Array.from(set).sort((a,b)=>a.localeCompare(b));
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

  buildRecommended(): void {
    const base = this.filtered.length ? this.filtered : this.projects;
    const scored = base.map(p => {
      let s = 0;
      if ((p.status||'') !== 'COMPLETED') s += 2;
      if (p.lastUpdated) {
        const days = (Date.now() - Date.parse(p.lastUpdated)) / (1000*60*60*24);
        if (!Number.isNaN(days)) s += Math.max(0, 10 - Math.min(10, Math.floor(days/7)));
      }
      if (p.fundingGoal != null) s += 3;
      if (p.fundingRaised != null) s += 2;
      return { p, s };
    });

    this.recommended = scored.sort((a,b)=>b.s-a.s).slice(0,6).map(x=>x.p);
  }

  // navegación al maestro
  openDetail(p: IMyProject) {
    if (!p?.id) return;
    this.router.navigate(['/proyectos-maestro', p.id]);
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
