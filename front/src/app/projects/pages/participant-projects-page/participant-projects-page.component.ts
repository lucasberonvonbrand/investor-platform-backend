import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Modules
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

// Services and Interfaces
import { ParticipantProjectsService } from '../../../core/services/participant-projects.service';
import { IMyProject } from '../../../core/services/my-projects.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-participant-projects-page',
  imports: [
    CommonModule, FormsModule,
    CardModule, ToolbarModule, ButtonModule, InputTextModule,
    TagModule, TableModule, DialogModule, DividerModule, TooltipModule, ToastModule,
  ],
  templateUrl: './participant-projects-page.component.html',
  providers: [MessageService]
})
export class ParticipantProjectsPageComponent implements OnInit {
  private svc = inject(ParticipantProjectsService);
  private toast = inject(MessageService);
  private router = inject(Router);
  private auth = inject(AuthService);

  q = signal('');

  projects = signal<IMyProject[]>([]);
  filtered = computed(() => {
    const query = this.q().toLowerCase().trim();
    return this.projects().filter(p => 
      !query ||
      p.title?.toLowerCase().includes(query) ||
      p.summary?.toLowerCase().includes(query) ||
      p.university?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query)
    );
  });

  recommended = computed(() => {
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
    return scored.sort((a, b) => b.s - a.s).slice(0, 6).map(x => x.p);
  });

  viewMode = signal<'cards' | 'table'>('cards');
  showDetail = signal(false);
  selected = signal<IMyProject | null>(null);
  loading = signal(false);

  kpis = computed(() => {
    const now = Date.now();
    const recentMs = 30 * 24 * 60 * 60 * 1000;
    const all = this.projects();
    return {
      total: all.length,
      activos: all.filter(p => (p.status || '') !== 'COMPLETED').length,
      recientes: all.filter(p => {
        const t = p.lastUpdated ? Date.parse(p.lastUpdated) : 0;
        return t && (now - t) <= recentMs;
      }).length,
      conFinanciacion: all.filter(p => p.fundingGoal != null).length
    };
  });

  private favKey = 'pp_fav_member_projects';
  favIds = signal<Set<number>>(new Set());
  private currentUser = this.auth.getSession();

  ngOnInit(): void {
    this.currentUser = this.auth.getSession();
    this.restoreFavs();
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.svc.getMineAsParticipant().subscribe({
      next: (list: IMyProject[]) => {
        this.projects.set((list || []).map(p => ({ 
          ...p, 
          category: p.category ?? '—', 
          status: p.status ?? 'IN_PROGRESS' 
        })));
        if (this.projects().length === 0) {
          this.toast.add({ severity: 'info', summary: 'Info', detail: 'You are not participating in any projects.' });
        }
      },
      error: (err: any) => {
        console.error(err);
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load participant projects.' });
      },
      complete: () => this.loading.set(false)
    });
  }

  private restoreFavs(): void {
    try {
      const raw = localStorage.getItem(this.favKey);
      if (raw) this.favIds.set(new Set(JSON.parse(raw)));
    } catch {
      this.favIds.set(new Set());
    }
  }

  private persistFavs(): void {
    localStorage.setItem(this.favKey, JSON.stringify(Array.from(this.favIds())));
  }

  isFav(id: number): boolean { 
    return this.favIds().has(id); 
  }

  toggleFav(p: IMyProject): void {
    if (!p?.id) return;
    const current = new Set(this.favIds());
    if (current.has(p.id)) {
      current.delete(p.id);
    } else {
      current.add(p.id);
    }
    this.favIds.set(current);
    this.persistFavs();
  }

  openDetail(p: IMyProject): void {
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
      default: return status || 'Sin Estado';
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
    for (let i = 0; i < (name || '').length; i++) {
      h = (h * 31 + name.charCodeAt(i)) >>> 0;
    }
    return h;
  }

  tagStyle(text: string | null | undefined, index: number) {
    const key = text ?? String(index);
    const c = this.tagPalette[this.hashKey(key) % this.tagPalette.length];
    return {
      'background-color': c.bg,
      color: c.fg,
      'border-color': 'transparent',
      'border-radius': '8px',
      'font-weight': 700,
      'padding': '0 .5rem'
    };
  }
}
