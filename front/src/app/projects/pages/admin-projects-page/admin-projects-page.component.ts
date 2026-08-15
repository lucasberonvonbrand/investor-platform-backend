import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { ProjectsService, IProject } from '../../services/projects.service';

@Component({
  selector: 'app-admin-projects-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    CardModule, ToolbarModule, ButtonModule, InputTextModule,
    TableModule, TagModule, ToastModule, DialogModule, DividerModule, TooltipModule
  ],
  templateUrl: './admin-projects-page.component.html',
  providers: [MessageService]
})
export class AdminProjectsPageComponent implements OnInit {
  private svc = inject(ProjectsService);
  private router = inject(Router);
  private toast = inject(MessageService);

  loading = signal(false);
  
  allProjects = signal<IProject[]>([]);
  filteredProjects = signal<IProject[]>([]);

  q = signal('');
  statusFilter = signal('');
  categories = signal<string[]>([]);

  showDetail = signal(false);
  selected = signal<IProject | null>(null);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.svc.getAllAdmin().subscribe({
      next: (list) => {
        this.allProjects.set(list || []);
        this.filteredProjects.set([...this.allProjects()]);
        this.buildCategories();
        this.applyFilter();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading admin projects', err);
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load projects' });
        this.allProjects.set([]);
        this.filteredProjects.set([]);
        this.loading.set(false);
      }
    });
  }

  applyFilter(): void {
    const query = this.q().toLowerCase().trim();
    const st = this.statusFilter().toLowerCase();
    
    const result = this.allProjects().filter(p => {
      const matchesQ = !query || (p.title || '').toLowerCase().includes(query) || (p.summary || '').toLowerCase().includes(query);
      const matchesStatus = !st || (p.status || '').toLowerCase() === st;
      return matchesQ && matchesStatus;
    });
    
    this.filteredProjects.set(result);
  }

  private buildCategories(): void {
    const set = new Set<string>(this.allProjects().map(p => p.category ?? '—'));
    this.categories.set(Array.from(set).sort((a, b) => a.localeCompare(b)));
  }

  onView(row: IProject): void {
    this.selected.set(row);
    this.showDetail.set(true);
  }

  goToProject(row: IProject): void {
    if (!row?.id) return;
    this.router.navigate(['/projects/admin-form', row.id], {
      state: { project: row }
    });
  }

  onDialogHide(): void { 
    this.showDetail.set(false); 
    this.selected.set(null); 
  }

  formatFunding(p: IProject): string {
    const goal = Number(p.fundingGoal ?? 0);
    const raised = Number(p.fundingRaised ?? 0);
    if (!goal && !raised) return '—';
    return `${raised.toLocaleString()} / ${goal.toLocaleString()}`;
  }

  getProjectStatusLabel(status: string | null | undefined): string {
    switch (status) {
      case 'PENDING_FUNDING': return 'Pending Funding';
      case 'IN_PROGRESS': return 'In Progress';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      case 'IDEA': return 'Idea';
      case 'MVP': return 'MVP';
      case 'FUNDING': return 'Funding';
      default: return status || 'Undefined';
    }
  }

  tagStyle(text: string, index: number = 0) {
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
