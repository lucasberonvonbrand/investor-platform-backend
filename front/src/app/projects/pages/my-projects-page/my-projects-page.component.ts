import { Component, OnInit, inject, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

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
import { IMyProject, MyProjectsService } from '../../services/my-projects.service';

@Component({
  standalone: true,
  selector: 'app-my-projects-page',
  imports: [
    CommonModule, FormsModule, RouterLink,
    CardModule, ToolbarModule, ButtonModule, InputTextModule,
    TagModule, TableModule, DialogModule, DividerModule, TooltipModule, ToastModule
  ],
  templateUrl: './my-projects-page.component.html',
  providers: [MessageService],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [style({ opacity: 0 }), animate('300ms ease-out', style({ opacity: 1 }))]),
      transition(':leave', [animate('300ms ease-in', style({ opacity: 0 }))]),
    ]),
  ]
})
export class MyProjectsPageComponent implements OnInit {
  private svc = inject(MyProjectsService);
  private toast = inject(MessageService);
  private router = inject(Router);

  @Input() includeAssigned = true;

  q = signal('');
  projects = signal<IMyProject[]>([]);
  filtered = signal<IMyProject[]>([]);
  recommended = signal<IMyProject[]>([]);

  viewMode = signal<'cards' | 'table'>('cards');
  loading = signal(true);

  kpis = signal({ total: 0, active: 0, recent: 0, funded: 0 });
  
  showEmptyState = computed(() => !this.loading() && this.projects().length === 0);

  private favKey = 'pp_fav_my_projects';
  favIds = signal<Set<number>>(new Set<number>());

  ngOnInit(): void {
    this.restoreFavs();
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.svc.getMine().subscribe({
      next: (list) => {
        const mapped = (list || []).map(p => ({
          ...p,
          category: p.category ?? '—',
          status: p.status ?? 'IN_PROGRESS'
        }));
        this.projects.set(mapped);
        this.applyFilters();
        this.computeKpis();
        this.buildRecommended();
      },
      error: (err: any) => {
        if (err.status === 404) {
          this.projects.set([]);
          this.applyFilters();
          this.computeKpis();
        } else {
          console.error(err);
          this.toast.add({ severity: 'error', summary: 'My Projects', detail: 'Could not load projects' });
        }
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    const query = (this.q() || '').toLowerCase().trim();
    const currentProjects = this.projects();

    const filteredList = currentProjects.filter(p => {
      return !query ||
        p.title?.toLowerCase().includes(query) ||
        p.summary?.toLowerCase().includes(query) ||
        p.university?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query);
    });
    this.filtered.set(filteredList);
  }

  computeKpis(): void {
    const now = Date.now(), recentMs = 30 * 24 * 60 * 60 * 1000;
    const currentProjects = this.projects();
    
    this.kpis.set({
      total: currentProjects.length,
      active: currentProjects.filter(p => (p.status || '') !== 'COMPLETED').length,
      recent: currentProjects.filter(p => {
        const t = p.lastUpdated ? Date.parse(p.lastUpdated) : 0;
        return t && (now - t) <= recentMs;
      }).length,
      funded: currentProjects.filter(p => p.fundingGoal != null).length
    });
  }

  buildRecommended(): void {
    const base = this.filtered().length ? this.filtered() : this.projects();
    const scored = base.map(p => {
      let s = 0;
      if ((p.status || '') !== 'COMPLETED') s += 2;
      if (p.lastUpdated) {
        const days = (Date.now() - Date.parse(p.lastUpdated)) / (1000 * 60 * 60 * 24);
        if (!Number.isNaN(days)) s += Math.max(0, 10 - Math.min(10, Math.floor(days / 7)));
      }
      if (p.fundingGoal != null) s += 3;
      if (p.fundingRaised != null) s += 2;
      return { p, s };
    });

    this.recommended.set(scored.sort((a, b) => b.s - a.s).slice(0, 6).map(x => x.p));
  }

  private restoreFavs(): void {
    try {
      const raw = localStorage.getItem(this.favKey);
      this.favIds.set(new Set(raw ? (JSON.parse(raw) as number[]) : []));
    } catch {
      this.favIds.set(new Set<number>());
    }
  }

  private persistFavs(): void {
    localStorage.setItem(this.favKey, JSON.stringify(Array.from(this.favIds())));
  }

  isFav(id: number): boolean { return this.favIds().has(id); }

  toggleFav(p: IMyProject): void {
    if (!p?.id) return;
    const favs = this.favIds();
    favs.has(p.id) ? favs.delete(p.id) : favs.add(p.id);
    this.favIds.set(new Set(favs));
    this.persistFavs();
  }

  openDetail(p: IMyProject) {
    if (!p?.id) return;
    this.router.navigate(['/projects/details', p.id]);
  }

  getProjectStatusLabel(status: string | null): string {
    switch (status) {
      case 'IN_PROGRESS': return 'En Progreso';
      case 'PENDING_FUNDING': return 'Pendiente de Financiación';
      case 'COMPLETED': return 'Completado';
      case 'NOT_FUNDED': return 'No Financiado';
      case 'CANCELLED': return 'Cancelado';
      default: return status || '—';
    }
  }

  getCategoryLabel(category: string | null | undefined): string {
    return !category || category === '—' ? 'Sin Categoría' : category;
  }

  private readonly tagPalette = [
    { bg: '#22c55e', fg: '#ffffff' },
    { bg: '#3b82f6', fg: '#ffffff' },
    { bg: '#f59e0b', fg: '#111111' },
    { bg: '#ef4444', fg: '#ffffff' },
    { bg: '#a855f7', fg: '#ffffff' },
    { bg: '#14b8a6', fg: '#ffffff' },
    { bg: '#06b6d4', fg: '#111111' },
  ];

  private hashKey(name: string): number {
    let h = 0; 
    for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0; 
    return h;
  }

  tagStyle(text: string, index: number) {
    const key = text ?? String(index);
    const c = this.tagPalette[this.hashKey(key) % this.tagPalette.length];
    return { 'background-color': c.bg, color: c.fg, 'border-color': 'transparent', 'border-radius': '8px', 'font-weight': 700, 'padding': '0 .5rem' };
  }
}
