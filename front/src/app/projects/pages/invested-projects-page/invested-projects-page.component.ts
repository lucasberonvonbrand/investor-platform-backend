import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { InvestedProjectsService, IInvestedProject } from '../../services/invested-projects.service';

@Component({
  selector: 'app-invested-projects-page',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    CardModule, ToolbarModule, ButtonModule, InputTextModule,
    TagModule, TableModule, TooltipModule, ToastModule
  ],
  templateUrl: './invested-projects-page.component.html',
  providers: [MessageService]
})
export class InvestedProjectsPageComponent implements OnInit {
  private svc = inject(InvestedProjectsService);
  private router = inject(Router);
  private toast = inject(MessageService);

  q = signal('');
  viewMode = signal<'cards' | 'table'>('cards');

  projects = signal<IInvestedProject[]>([]);
  filtered = signal<IInvestedProject[]>([]);
  
  loading = signal(false);

  kpis = signal({
    total: 0,
    active: 0,
    recent: 0,
    funded: 0
  });

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.svc.getByInvestment().subscribe({
      next: (list) => {
        const mapped = (list || []).map(p => ({ ...p, category: p.category ?? '—', status: p.status ?? 'IN_PROGRESS' }));
        this.projects.set(mapped);
        this.applyFilters();
        this.computeKpis(mapped);
      },
      error: (err) => {
        console.error('Error fetching invested projects', err);
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load invested projects' });
        this.projects.set([]);
        this.filtered.set([]);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  applyFilters(): void {
    const query = this.q().toLowerCase().trim();
    const result = this.projects().filter(p => {
      return !query || (p.title || '').toLowerCase().includes(query) || (p.summary || '').toLowerCase().includes(query);
    });
    this.filtered.set(result);
  }

  private computeKpis(list: IInvestedProject[]): void {
    const now = new Date();
    const days30 = 1000 * 60 * 60 * 24 * 30;
    
    this.kpis.set({
      total: list.length,
      active: list.filter(p => (p.status || '').toUpperCase().includes('IN_PROGRESS') || (p.status || '').toUpperCase().includes('FUNDING')).length,
      funded: list.filter(p => (p.fundingRaised ?? 0) > 0).length,
      recent: list.filter(p => {
        if (!p.lastUpdated) return false;
        const d = new Date(p.lastUpdated);
        return !isNaN(d.getTime()) && (now.getTime() - d.getTime()) <= days30;
      }).length
    });
  }

  openDetail(p: IInvestedProject): void {
    if (!p?.id) return;
    this.router.navigate(['/projects/details', p.id]);
  }

  getProjectStatusLabel(status: string | null | undefined): string {
    switch (status) {
      case 'IN_PROGRESS': return 'In Progress';
      case 'PENDING_FUNDING': return 'Pending Funding';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      case 'IDEA': return 'Idea';
      case 'MVP': return 'MVP';
      case 'FUNDING': return 'Funding';
      default: return status || 'Undefined';
    }
  }

  getCategoryLabel(category: string | null | undefined): string {
    return !category || category === '—' ? 'Uncategorized' : category;
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
