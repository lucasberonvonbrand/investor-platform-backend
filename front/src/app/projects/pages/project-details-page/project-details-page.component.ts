import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ProjectDetailsService, ContactOwnerDTO } from '../../services/project-details.service';
import { IMyProject } from '../../services/my-projects.service';
import { AuthService } from '../../../auth/services/auth.service';

import { ProjectOverviewComponent } from '../../components/project-overview/project-overview.component';
import { ProjectContractsComponent } from '../../components/project-contracts/project-contracts.component';
import { StudentsService } from '../../../students/services/students.service';

@Component({
  standalone: true,
  selector: 'app-project-details-page',
  imports: [
    CommonModule, ToolbarModule, ButtonModule, ToastModule,
    ProjectOverviewComponent, ProjectContractsComponent
  ],
  templateUrl: './project-details-page.component.html',
  providers: [MessageService]
})
export class ProjectDetailsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(ProjectDetailsService);
  private studentSvc = inject(StudentsService);
  private toast = inject(MessageService);
  private auth = inject(AuthService);

  projectId = signal<number>(0);
  project = signal<IMyProject | null>(null);
  loading = signal(true);

  activeTab = signal<'overview' | 'contracts'>('overview');

  currentUser = this.auth.getSession();
  isInvestor = computed(() => this.currentUser?.roles.includes('ROLE_INVESTOR') ?? false);
  isOwner = computed(() => this.project()?.ownerId === this.currentUser?.id);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.projectId.set(+idParam);
      this.loadProject();
    }
  }

  loadProject(): void {
    this.loading.set(true);
    this.svc.getProjectById(this.projectId()).subscribe({
      next: (p) => {
        this.project.set(p);
      },
      error: () => {
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los detalles del proyecto.' });
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    window.history.back();
  }

  contactOwner(): void {
    const ownerName = this.project()?.owner;
    const students = this.project()?.students || [];
    const foundStudent = students.find(s => s.name.trim().toLowerCase() === ownerName?.trim().toLowerCase());
    
    const ownerId = foundStudent ? foundStudent.id : this.project()?.ownerId;
    
    if (ownerId) {
      this.studentSvc.getById(ownerId).subscribe({
        next: (student) => {
          if (student?.email) {
            const subject = encodeURIComponent(`Consulta sobre el proyecto: ${this.project()?.title}`);
            const body = encodeURIComponent(`Hola ${student.firstName},\n\nTe escribo desde la plataforma de inversores de ProyPlus respecto a tu proyecto "${this.project()?.title}"...`);
            window.location.href = `mailto:${student.email}?subject=${subject}&body=${body}`;
          } else {
            this.toast.add({ severity: 'error', summary: 'Error', detail: 'El creador no tiene un email registrado.' });
          }
        },
        error: () => {
          // Si falla y había un fallback, intentamos con el de respaldo
          if (foundStudent && this.project()?.ownerId && this.project()?.ownerId !== foundStudent.id) {
            this.studentSvc.getById(this.project()!.ownerId!).subscribe({
              next: (student) => {
                if (student?.email) {
                  const subject = encodeURIComponent(`Consulta sobre el proyecto: ${this.project()?.title}`);
                  const body = encodeURIComponent(`Hola ${student.firstName},\n\nTe escribo desde la plataforma de inversores de ProyPlus respecto a tu proyecto "${this.project()?.title}"...`);
                  window.location.href = `mailto:${student.email}?subject=${subject}&body=${body}`;
                } else {
                  this.toast.add({ severity: 'error', summary: 'Error', detail: 'El creador no tiene un email registrado.' });
                }
              },
              error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener el email del creador.' })
            });
          } else {
            this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener el email del creador.' });
          }
        }
      });
    } else {
      this.toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'No se identificó el creador de este proyecto.' });
    }
  }

  setTab(tab: 'overview' | 'contracts'): void {
    this.activeTab.set(tab);
  }

  goToRiskAnalysis(): void {
    if (this.project()) {
      this.router.navigate(['/projects/analysis', this.projectId()]);
    }
  }
}
// Trigger recompile
