import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ChartModule } from 'primeng/chart';
import type { ChartData, ChartOptions } from 'chart.js';

import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { UsersService, IUser } from '../../core/services/users.service';
import { StudentService } from '../../core/services/students.service';
import { InvestorService } from '../../core/services/investors.service';
import { ProjectsService, IProject } from '../../core/services/projects.service';
import { InvestmentsService, IContractLite } from '../../core/services/investments.service';

type AnyObj = Record<string, any>;

@Component({
  standalone: true,
  selector: 'app-panel',
  imports: [CommonModule, CardModule, ButtonModule, TagModule, TooltipModule, ToastModule, ChartModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [MessageService]
})
export class PanelComponent implements OnInit {
  private usersSvc = inject(UsersService);
  private studentsSvc = inject(StudentService);
  private investorsSvc = inject(InvestorService);
  private projectsSvc = inject(ProjectsService);   // 👈 Proyectos (línea de tiempo)
  private investmentsSvc = inject(InvestmentsService);
  private toast = inject(MessageService);

  loading = false;

  // 🔹 Activamos las gráficas
  chartsEnabled = true;

  // KPI cards
  kpis = {
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
  };

  users: IUser[] = [];
  students: AnyObj[] = [];
  investors: AnyObj[] = [];

  // ===== Proyectos & Timeline =====
  projects: IProject[] = [];
  contracts: IContractLite[] = [];
  projectsTimelineData!: ChartData<'line'>;
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

  // ===== Data de otros charts =====
  studentsByDegreeData!: ChartData<'doughnut'>;
  usersByRoleData!: ChartData<'bar'>;
  universitiesData!: ChartData<'bar'>;
  projectsByStatusData!: ChartData<'doughnut'>;
  investmentsTimelineData!: ChartData<'line'>;

  // Opciones comunes
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
    this.loading = true;

    forkJoin({
      users: this.usersSvc.getAll().pipe(catchError(() => of([] as IUser[]))),
      students: this.studentsSvc.loadAll().pipe(catchError(() => of([] as AnyObj[]))),
      investors: this.investorsSvc.loadAll().pipe(catchError(() => of([] as AnyObj[]))),
      projects: this.projectsSvc.getAll().pipe(catchError(() => of([] as IProject[]))),
      contracts: this.investmentsSvc.getAllContracts().pipe(catchError(() => of([] as IContractLite[])))
    }).subscribe({
      next: ({ users, students, investors, projects, contracts }) => {
        this.users = users || [];
        this.students = students || [];
        this.investors = investors || [];
        this.projects = projects || [];
        this.contracts = contracts || [];

        // KPIs
        const activeStudents = this.students.filter(s => s?.enabled).length;
        const activeInvestors = this.investors.filter(i => i?.enabled).length;

        this.kpis = {
          totalUsers: this.users.length,
          totalStudents: this.students.length,
          totalInvestors: this.investors.length,
          activeStudents,
          inactiveStudents: this.students.length - activeStudents,
          activeInvestors,
          inactiveInvestors: this.investors.length - activeInvestors,
          fundedProjects: this.projects.filter(p => (p.fundingRaised ?? 0) > 0).length,
          totalInvested: this.projects.reduce((sum, p) => sum + (p.fundingRaised ?? 0), 0),
          totalInvestedARS: this.contracts.filter(c => c.status === 'activo' && c.currency === 'ARS').reduce((sum, c) => sum + (c.amount ?? 0), 0),
          totalInvestedCNY: this.contracts.filter(c => c.status === 'activo' && c.currency === 'CNY').reduce((sum, c) => sum + (c.amount ?? 0), 0),
          activeContracts: this.contracts.filter(c => c.status === 'activo').length,
        };

        // Charts
        if (this.chartsEnabled) {
          this.buildStudentsByDegreeChart();
          this.buildUsersByRoleChart();
          this.buildUniversitiesChart();
          this.buildProjectsTimeline(); // 👈 timeline de proyectos
          this.buildProjectsByStatusChart();
          this.buildInvestmentsTimeline();
        }
      },
      error: (err) => {
        console.error(err);
        this.toast.add({ severity: 'error', summary: 'Panel', detail: 'No se pudieron cargar los datos' });
      },
      complete: () => (this.loading = false)
    });
  }

  // ===== Helpers de colores =====
  private palette(idx: number) {
    const colors = [
      '#3b82f6', // blue-500
      '#22c55e', // green-500
      '#f59e0b', // amber-500
      '#ef4444', // red-500
      '#a855f7', // purple-500
      '#06b6d4', // cyan-500
      '#14b8a6', // teal-500
      '#f97316', // orange-500
    ];
    return colors[idx % colors.length];
  }
  private seriesColors(n: number) {
    return Array.from({ length: n }, (_, i) => this.palette(i));
  }

  // ====== Charts builders ======
  private buildStudentsByDegreeChart() {
    const order = ['IN_PROGRESS', 'COMPLETED', 'PAUSED', 'DROPPED', 'UNKNOWN'];
    const counts: Record<string, number> = {};

    for (const s of this.students) {
      const k = (s?.degreeStatus ?? 'UNKNOWN') as string;
      counts[k] = (counts[k] ?? 0) + 1;
    }

    const labels = Object.keys(counts).sort((a, b) => order.indexOf(a) - order.indexOf(b));
    const data = labels.map(l => counts[l]);

    this.studentsByDegreeData = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: this.seriesColors(labels.length),
          borderWidth: 0
        }
      ]
    };
  }

  private buildUsersByRoleChart() {
    const counts: Record<string, number> = {};
    for (const u of this.users as any[]) {
      // La lista de roles viene en `u.roles` que es un array de strings como "ROLE_STUDENT"
      const roles: any[] = u?.rolesList ?? u?.roles ?? [];
      // Buscamos el rol principal (ADMIN, STUDENT, INVESTOR) para evitar contar permisos como 'CREATE'
      const mainRole = roles.find(r => (r?.role ?? r ?? '').startsWith('ROLE_'));
      if (mainRole) { // `mainRole` puede ser un objeto {id, role} o un string "ROLE_..."
        // Quitamos 'ROLE_' para que la etiqueta sea más limpia (ej: 'STUDENT')
        const roleName = (mainRole.role ?? mainRole).replace('ROLE_', '');
        counts[roleName] = (counts[roleName] ?? 0) + 1;
      }
    }
    const labels = Object.keys(counts).sort((a, b) => a.localeCompare(b));
    const data = labels.map(l => counts[l]);

    this.usersByRoleData = {
      labels,
      datasets: [
        {
          label: 'Usuarios',
          data,
          backgroundColor: this.seriesColors(labels.length)
        }
      ]
    };
  }

  private buildUniversitiesChart() {
    const uniCounts: Record<string, number> = {};
    for (const s of this.students) {
      const uni = s?.university ?? '—';
      uniCounts[uni] = (uniCounts[uni] ?? 0) + 1;
    }
    const labels = Object.keys(uniCounts).sort();
    const data = labels.map(l => uniCounts[l]);

    this.universitiesData = {
      labels,
      datasets: [
        {
          label: 'Estudiantes',
          data,
          backgroundColor: this.seriesColors(labels.length)
        }
      ]
    };
  }

  private buildProjectsByStatusChart() {
    const counts: Record<string, number> = {};
    for (const p of this.projects) {
      const status = p.status || 'UNKNOWN';
      counts[status] = (counts[status] ?? 0) + 1;
    }

    const labels = Object.keys(counts);
    const data = labels.map(l => counts[l]);

    this.projectsByStatusData = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: this.seriesColors(labels.length),
          borderWidth: 0
        }
      ]
    };
  }

  // ====== Línea de tiempo de proyectos (últimos 12 meses) ======
  private buildProjectsTimeline(): void {
    const now = new Date();
    const labels: string[] = [];
    const keys: string[] = [];

    const ymKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    // Ventana de 12 meses (incluye el actual)
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }));
      keys.push(ymKey(d));
    }

    const counts: Record<string, number> = Object.fromEntries(keys.map(k => [k, 0])) as Record<string, number>;

    // Usamos p.lastUpdated (mappeado desde startDate en ProjectsService). Fallback: startDate si existiera.
    const getIso = (p: IProject | any): string | null => p?.lastUpdated ?? p?.startDate ?? null;

    for (const p of this.projects) {
      const iso = getIso(p);
      if (!iso) continue;
      const d = new Date(iso);
      if (isNaN(+d)) continue;
      const k = ymKey(new Date(d.getFullYear(), d.getMonth(), 1));
      if (k in counts) counts[k] += 1;
    }

    const data = keys.map(k => counts[k] ?? 0);

    this.projectsTimelineData = {
      labels,
      datasets: [
        {
          label: 'Proyectos actualizados',
          data,
          fill: false,
          borderColor: '#3b82f6',
          pointBackgroundColor: '#3b82f6'
        }
      ]
    };
  }

  private buildInvestmentsTimeline(): void {
    const now = new Date();
    const labels: string[] = [];
    const keys: string[] = [];

    const ymKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }));
      keys.push(ymKey(d));
    }

    const amounts: Record<string, number> = Object.fromEntries(keys.map(k => [k, 0]));

    for (const c of this.contracts) {
      if (c.status !== 'activo' || !c.startDate || !c.amount) continue;
      const d = new Date(c.startDate);
      if (isNaN(+d)) continue;
      const k = ymKey(new Date(d.getFullYear(), d.getMonth(), 1));
      if (k in amounts) amounts[k] += c.amount;
    }

    const data = keys.map(k => amounts[k] ?? 0);

    this.investmentsTimelineData = {
      labels,
      datasets: [
        {
          label: 'Monto Invertido (USD)',
          data,
          fill: true,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          pointBackgroundColor: '#22c55e'
        }
      ]
    };
  }
}
