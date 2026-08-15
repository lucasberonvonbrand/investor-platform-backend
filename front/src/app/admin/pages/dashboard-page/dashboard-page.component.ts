import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ChartModule } from 'primeng/chart';
import type { ChartData, ChartOptions } from 'chart.js';

import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { UsersService, IUser } from '../../../core/services/users.service';
import { StudentsService, IStudent, DegreeStatus, University } from '../../../students/services/students.service';
import { InvestorsService, IInvestor } from '../../../investors/services/investors.service';
import { ProjectsService, IProject } from '../../../projects/services/projects.service';
import { InvestmentsService, IContractLite } from '../../../investors/services/investments.service';

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [CommonModule, CardModule, TagModule, ToastModule, ChartModule],
  templateUrl: './dashboard-page.component.html',
  providers: [MessageService]
})
export class DashboardPageComponent implements OnInit {
  private usersSvc = inject(UsersService);
  private studentsSvc = inject(StudentsService);
  private investorsSvc = inject(InvestorsService);
  private projectsSvc = inject(ProjectsService);
  private investmentsSvc = inject(InvestmentsService);
  private toast = inject(MessageService);

  loading = signal(true);

  kpis = signal({
    totalUsers: 0,
    totalStudents: 0,
    totalInvestors: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    activeInvestors: 0,
    inactiveInvestors: 0,
    fundedProjects: 0,
    totalInvested: 0,
    totalInvestedARS: 0,
    totalInvestedCNY: 0,
    activeContracts: 0,
  });

  users = signal<IUser[]>([]);
  students = signal<IStudent[]>([]);
  investors = signal<IInvestor[]>([]);
  projects = signal<IProject[]>([]);
  contracts = signal<IContractLite[]>([]);

  // Charts Data
  studentsByDegreeData = signal<ChartData<'doughnut'> | null>(null);
  usersByRoleData = signal<ChartData<'bar'> | null>(null);
  universitiesData = signal<ChartData<'bar'> | null>(null);
  projectsByStatusData = signal<ChartData<'doughnut'> | null>(null);
  projectsTimelineData = signal<ChartData<'line'> | null>(null);
  investmentsTimelineData = signal<ChartData<'line'> | null>(null);

  projectsLineOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    elements: { line: { tension: 0.3 } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
    }
  };

  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      x: { grid: { display: false }, ticks: { autoSkip: true, maxRotation: 0 } },
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
    }
  };

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);

    forkJoin({
      users: this.usersSvc.getAll().pipe(catchError(() => of([] as IUser[]))),
      students: this.studentsSvc.loadAll().pipe(catchError(() => of([] as IStudent[]))),
      investors: this.investorsSvc.loadAll().pipe(catchError(() => of([] as IInvestor[]))),
      projects: this.projectsSvc.getAll().pipe(catchError(() => of([] as IProject[]))),
      contracts: this.investmentsSvc.getAllContracts().pipe(catchError(() => of([] as IContractLite[])))
    }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: ({ users, students, investors, projects, contracts }) => {
        this.users.set(users || []);
        this.students.set(students || []);
        this.investors.set(investors || []);
        this.projects.set(projects || []);
        this.contracts.set(contracts || []);

        const activeStudents = this.students().filter(s => s.enabled).length;
        const activeInvestors = this.investors().filter(i => i.enabled).length;

        this.kpis.set({
          totalUsers: this.users().length,
          totalStudents: this.students().length,
          totalInvestors: this.investors().length,
          activeStudents,
          inactiveStudents: this.students().length - activeStudents,
          activeInvestors,
          inactiveInvestors: this.investors().length - activeInvestors,
          fundedProjects: this.projects().filter(p => (p.fundingRaised ?? 0) > 0).length,
          totalInvested: this.projects().reduce((sum, p) => sum + (p.fundingRaised ?? 0), 0),
          totalInvestedARS: this.contracts().filter(c => c.status === 'activo' && c.currency === 'ARS').reduce((sum, c) => sum + (c.amount ?? 0), 0),
          totalInvestedCNY: this.contracts().filter(c => c.status === 'activo' && c.currency === 'CNY').reduce((sum, c) => sum + (c.amount ?? 0), 0),
          activeContracts: this.contracts().filter(c => c.status === 'activo').length,
        });

        this.buildCharts();
      },
      error: (err) => {
        console.error(err);
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load data' });
      }
    });
  }

  private palette(idx: number) {
    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#14b8a6', '#f97316'];
    return colors[idx % colors.length];
  }

  private seriesColors(n: number) {
    return Array.from({ length: n }, (_, i) => this.palette(i));
  }

  private buildCharts(): void {
    this.buildStudentsByDegreeChart();
    this.buildUsersByRoleChart();
    this.buildUniversitiesChart();
    this.buildProjectsByStatusChart();
    this.buildProjectsTimeline();
    this.buildInvestmentsTimeline();
  }

  private buildStudentsByDegreeChart() {
    const order = ['IN_PROGRESS', 'COMPLETED', 'SUSPENDED', 'ABANDONED', 'UNKNOWN'];
    const counts: Record<string, number> = {};

    for (const s of this.students()) {
      const k = (s.degreeStatus ?? 'UNKNOWN') as string;
      counts[k] = (counts[k] ?? 0) + 1;
    }

    const labels = Object.keys(counts).sort((a, b) => order.indexOf(a) - order.indexOf(b));
    const data = labels.map(l => counts[l]);

    this.studentsByDegreeData.set({
      labels: labels.map(l => l.replace(/_/g, ' ')),
      datasets: [{ data, backgroundColor: this.seriesColors(labels.length), borderWidth: 0 }]
    });
  }

  private buildUsersByRoleChart() {
    const counts: Record<string, number> = {};
    for (const u of this.users() as any[]) {
      const roles: any[] = u?.rolesList ?? u?.roles ?? [];
      const mainRole = roles.find(r => (r?.role ?? r ?? '').startsWith('ROLE_'));
      if (mainRole) {
        const roleName = (mainRole.role ?? mainRole).replace('ROLE_', '');
        counts[roleName] = (counts[roleName] ?? 0) + 1;
      }
    }
    const labels = Object.keys(counts).sort((a, b) => a.localeCompare(b));
    const data = labels.map(l => counts[l]);

    this.usersByRoleData.set({
      labels,
      datasets: [{ label: 'Users', data, backgroundColor: this.seriesColors(labels.length) }]
    });
  }

  private buildUniversitiesChart() {
    const uniCounts: Record<string, number> = {};
    for (const s of this.students()) {
      const uni = s.university ?? '—';
      uniCounts[uni] = (uniCounts[uni] ?? 0) + 1;
    }
    const labels = Object.keys(uniCounts).sort();
    const data = labels.map(l => uniCounts[l]);

    this.universitiesData.set({
      labels: labels.map(l => l.replace(/_/g, ' ')),
      datasets: [{ label: 'Students', data, backgroundColor: this.seriesColors(labels.length) }]
    });
  }

  private buildProjectsByStatusChart() {
    const counts: Record<string, number> = {};
    for (const p of this.projects()) {
      const status = p.status || 'UNKNOWN';
      counts[status] = (counts[status] ?? 0) + 1;
    }

    const labels = Object.keys(counts);
    const data = labels.map(l => counts[l]);

    this.projectsByStatusData.set({
      labels: labels.map(l => l.replace(/_/g, ' ')),
      datasets: [{ data, backgroundColor: this.seriesColors(labels.length), borderWidth: 0 }]
    });
  }

  private buildProjectsTimeline(): void {
    const now = new Date();
    const labels: string[] = [];
    const keys: string[] = [];
    const ymKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      keys.push(ymKey(d));
    }

    const counts: Record<string, number> = Object.fromEntries(keys.map(k => [k, 0])) as Record<string, number>;
    const getIso = (p: IProject | any): string | null => p?.lastUpdated ?? p?.startDate ?? null;

    for (const p of this.projects()) {
      const iso = getIso(p);
      if (!iso) continue;
      const d = new Date(iso);
      if (isNaN(+d)) continue;
      const k = ymKey(new Date(d.getFullYear(), d.getMonth(), 1));
      if (k in counts) counts[k] += 1;
    }

    const data = keys.map(k => counts[k] ?? 0);
    this.projectsTimelineData.set({
      labels,
      datasets: [{ label: 'Updated Projects', data, fill: false, borderColor: '#3b82f6', pointBackgroundColor: '#3b82f6' }]
    });
  }

  private buildInvestmentsTimeline(): void {
    const now = new Date();
    const labels: string[] = [];
    const keys: string[] = [];
    const ymKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      keys.push(ymKey(d));
    }

    const amounts: Record<string, number> = Object.fromEntries(keys.map(k => [k, 0]));

    for (const c of this.contracts()) {
      if (c.status !== 'activo' || !c.startDate || !c.amount) continue;
      const d = new Date(c.startDate);
      if (isNaN(+d)) continue;
      const k = ymKey(new Date(d.getFullYear(), d.getMonth(), 1));
      if (k in amounts) amounts[k] += c.amount;
    }

    const data = keys.map(k => amounts[k] ?? 0);
    this.investmentsTimelineData.set({
      labels,
      datasets: [{ label: 'Invested Amount (USD)', data, fill: true, borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.2)', pointBackgroundColor: '#22c55e' }]
    });
  }
}
