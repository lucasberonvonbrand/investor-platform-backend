import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { InvestedProjectsService, IInvestedProject } from '../../../core/services/my-invested-projects.service';

@Component({
  selector: 'app-proyectos-invertidos',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    CardModule, ToolbarModule, ButtonModule, InputTextModule,
    TagModule, TableModule, DividerModule, TooltipModule, ToastModule
  ],
  templateUrl: './proyectos-invertidos.component.html',
  styleUrls: ['./proyectos-invertidos.component.scss'],
  providers: [MessageService]
})
export class ProyectosInvertidosComponent implements OnInit {
  private svc = inject(InvestedProjectsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(MessageService);

  // filtros
  q = '';
  selectedCategory = '';
  categories: string[] = [];

  // datos
  projects: IInvestedProject[] = [];
  filtered: IInvestedProject[] = [];

  // vista
  viewMode: 'cards' | 'table' = 'cards';

  // loading / label
  loading = false;
  displayLabel = '';

  // favorites
  private favKey = 'pp_fav_invested_projects';
  favIds = new Set<number>();

  // tag palette & helper
  private readonly tagPalette = [
    { bg: '#22c55e', fg: '#ffffff' },
    { bg: '#3b82f6', fg: '#ffffff' },
    { bg: '#f59e0b', fg: '#111111' },
    { bg: '#ef4444', fg: '#ffffff' },
    { bg: '#a855f7', fg: '#ffffff' },
    { bg: '#14b8a6', fg: '#ffffff' },
    { bg: '#06b6d4', fg: '#111111' },
  ];
  private hashKey(name: string): number { let h=0; for (let i=0;i<(name||'').length;i++) h=(h*31+name.charCodeAt(i))>>>0; return h; }
  tagStyle(text: string, index: number) {
    const key = text ?? String(index);
    const c = this.tagPalette[this.hashKey(key) % this.tagPalette.length];
    return { 'background-color': c.bg, color: c.fg, 'border-color': 'transparent', 'border-radius': '8px', 'font-weight': 700, 'padding': '0 .5rem' };
  }

  ngOnInit(): void {
    this.restoreFavs();
    this.route.paramMap.subscribe(pm => {
      const raw = pm.get('investmentId') || pm.get('id');
      if (!raw) {
        this.toast.add({ severity: 'warn', summary: 'Proyectos invertidos', detail: 'No se indicó investmentId en la ruta' });
        return;
      }
      const id = Number(raw);
      if (Number.isNaN(id)) {
        this.toast.add({ severity: 'error', summary: 'Proyectos invertidos', detail: 'investmentId inválido' });
        return;
      }
      this.displayLabel = `Inversión #${id}`;
      this.loadByInvestment(id);
    });
  }

  private restoreFavs(): void {
    try {
      const raw = localStorage.getItem(this.favKey);
      this.favIds = new Set(raw ? (JSON.parse(raw) as number[]) : []);
    } catch {
      this.favIds = new Set<number>();
    }
  }

  private persistFavs(): void {
    localStorage.setItem(this.favKey, JSON.stringify(Array.from(this.favIds)));
  }

  isFav(id: number): boolean { return this.favIds.has(id); }
  toggleFav(p: IInvestedProject): void {
    if (!p?.id) return;
    this.favIds.has(p.id) ? this.favIds.delete(p.id) : this.favIds.add(p.id);
    this.persistFavs();
  }

  private loadByInvestment(investmentId: number): void {
    this.loading = true;
    this.svc.getByInvestment(investmentId).subscribe({
      next: (list) => {
        this.projects = (list || []).map(p => ({ ...p, category: p.category ?? '—', status: p.status ?? 'IN_PROGRESS' }));
        this.applyFilters();
        this.buildCategories();
      },
      error: (err) => {
        console.error('Error fetching invested projects', err);
        this.toast.add({ severity: 'error', summary: 'Proyectos invertidos', detail: 'No se pudieron cargar los proyectos' });
        this.projects = [];
        this.filtered = [];
        this.loading = false;
      },
      complete: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    const q = (this.q || '').toLowerCase().trim();
    const cat = (this.selectedCategory || '').toLowerCase();
    this.filtered = this.projects.filter(p => {
      const matchesQ = !q || (p.title || '').toLowerCase().includes(q) || (p.summary || '').toLowerCase().includes(q);
      const matchesCat = !cat || (p.category || '').toLowerCase() === cat;
      return matchesQ && matchesCat;
    });
  }

  private buildCategories(): void {
    const set = new Set<string>(this.projects.map(p => p.category ?? '—'));
    this.categories = Array.from(set).sort((a,b)=>a.localeCompare(b));
  }

  openDetail(p: IInvestedProject): void {
    if (!p?.id) return;
    this.router.navigate(['/proyectos-maestro', p.id]);
  }

  goBack(): void {
    this.router.navigate(['/mismarquesinas']);
  }
}