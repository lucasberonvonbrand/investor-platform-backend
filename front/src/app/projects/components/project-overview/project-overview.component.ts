import { Component, input, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { DialogModule } from 'primeng/dialog';
import { IMyProject } from '../../services/my-projects.service';
import { ProjectDocumentsService, IProjectDocument } from '../../services/project-documents.service';
import { StudentsService, IStudent } from '../../../students/services/students.service';
import { AuthService } from '../../../auth/services/auth.service';
import { forkJoin } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

type Student = { id: number; name: string; email?: string };

@Component({
  standalone: true,
  selector: 'app-project-overview',
  imports: [
    CommonModule, CardModule, TagModule, TooltipModule,
    ProgressBarModule, FileUploadModule, ButtonModule, ToastModule, DialogModule
  ],
  templateUrl: './project-overview.component.html',
  styles: [`
    .progress-low :global(.p-progressbar-value) { background-color: #ef4444 !important; }
    .progress-medium :global(.p-progressbar-value) { background-color: #f59e0b !important; }
    .progress-high :global(.p-progressbar-value) { background-color: #10b981 !important; }
  `],
  providers: [MessageService]
})
export class ProjectOverviewComponent {
  project = input.required<IMyProject | null>();
  isOwner = input.required<boolean>();

  private docSvc = inject(ProjectDocumentsService);
  private studentSvc = inject(StudentsService);
  private auth = inject(AuthService);
  private toast = inject(MessageService);
  private sanitizer = inject(DomSanitizer);

  documents = signal<IProjectDocument[]>([]);
  selectedStudent = signal<Student | null>(null);
  detailedStudent = signal<IStudent | null>(null);
  profileVisible = signal(false);

  previewPdfVisible = signal(false);
  previewPdfName = signal<string>('');
  previewPdfUrl = signal<SafeResourceUrl | null>(null);
  rawPdfUrl = signal<string | null>(null);

  isCurrentUserInvestor = computed(() => this.auth.getSession()?.roles.includes('ROLE_INVESTOR') ?? false);

  openStudentProfile(student: Student): void {
    this.selectedStudent.set(student);
    this.detailedStudent.set(null);
    this.profileVisible.set(true);

    this.studentSvc.getById(student.id).subscribe({
      next: (fullStudent) => {
        this.detailedStudent.set(fullStudent);
      },
      error: () => {
        // Fallback to basic info if request fails
        this.detailedStudent.set({
          id: student.id,
          firstName: student.name.split(' ')[0] || student.name,
          lastName: student.name.split(' ').slice(1).join(' ') || '',
          email: student.email || '',
        } as any);
      }
    });
  }

  getDegreeStatusLabel(status: string | undefined): string {
    if (!status) return '—';
    const map: Record<string, string> = {
      'IN_PROGRESS': 'En Curso',
      'COMPLETED': 'Completo',
      'SUSPENDED': 'Suspendido',
      'ABANDONED': 'Abandonado'
    };
    return map[status] || status;
  }
  
  team = computed(() => {
    const p = this.project();
    const list = (p?.students as any[]) || [];
    return list.map((s: any) => {
      let displayName = s.name;
      if (!displayName) {
        displayName = [s.firstName, s.lastName].filter(Boolean).join(' ');
      }
      if (!displayName || !displayName.trim()) {
        displayName = s.email || `Estudiante #${s.id || ''}`;
      }
      return {
        id: s.id,
        name: displayName,
        email: s.email
      };
    });
  });

  fundingProgress = computed(() => {
    const p = this.project();
    if (!p || !p.fundingGoal || p.fundingGoal <= 0 || !p.fundingRaised) {
      return 0;
    }
    return Math.min(100, (p.fundingRaised / p.fundingGoal) * 100);
  });

  constructor() {
    effect(() => {
      const p = this.project();
      if (p?.id) {
        this.loadDocuments(p.id);
      }
    });
  }

  loadDocuments(projectId: number): void {
    this.docSvc.getDocumentsByProject(projectId).subscribe({
      next: (docs) => this.documents.set(docs),
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los documentos.' })
    });
  }

  getUploadUrl(): string {
    const p = this.project();
    return p?.id ? `${this.docSvc.getUploadUrl()}?projectId=${p.id}` : this.docSvc.getUploadUrl();
  }

  onUpload(event: any): void {
    this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Los documentos han sido subidos correctamente.' });
    const p = this.project();
    if (p?.id) this.loadDocuments(p.id);
  }

  onCustomUpload(event: any): void {
    const files: File[] = event.files || [];
    const p = this.project();
    if (!p?.id || files.length === 0) return;

    const uploads = files.map(file => this.docSvc.uploadDocumentFile(file, p.id));
    forkJoin(uploads).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Los documentos han sido subidos correctamente.' });
        this.loadDocuments(p.id);
      },
      error: (err) => {
        console.error('Error uploading documents:', err);
        this.toast.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'No se pudieron subir los documentos.' });
      }
    });
  }

  onUploadError(event: any): void {
    this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron subir los documentos.' });
  }

  deleteDocument(doc: IProjectDocument): void {
    this.docSvc.deleteDocument(doc.id).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Eliminado', detail: 'El documento ha sido eliminado.' });
        this.documents.update(docs => docs.filter(d => d.id !== doc.id));
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el documento.' })
    });
  }

  downloadDocument(doc: IProjectDocument): void {
    this.docSvc.downloadDocumentFile(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el documento.' })
    });
  }

  previewDocument(doc: IProjectDocument): void {
    this.previewPdfName.set(doc.fileName);
    this.previewPdfVisible.set(true);
    this.previewPdfUrl.set(null); // Show loading spinner
    
    this.docSvc.downloadDocumentFile(doc.id).subscribe({
      next: (blob) => {
        const objectUrl = window.URL.createObjectURL(blob);
        this.rawPdfUrl.set(objectUrl);
        this.previewPdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl));
      },
      error: () => {
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el documento para visualizar.' });
        this.previewPdfVisible.set(false);
      }
    });
  }

  onPreviewClose(visible: boolean): void {
    if (!visible) {
      this.previewPdfVisible.set(false);
      const raw = this.rawPdfUrl();
      if (raw) {
        window.URL.revokeObjectURL(raw);
      }
      this.previewPdfUrl.set(null);
      this.rawPdfUrl.set(null);
    }
  }

  getProjectStatusLabel(status: string | null | undefined): string {
    switch (status) {
      case 'IN_PROGRESS': return 'En Progreso';
      case 'PENDING_FUNDING': return 'Pendiente de Financiación';
      case 'COMPLETED': return 'Completado';
      case 'NOT_FUNDED': return 'No Financiado';
      case 'CANCELLED': return 'Cancelado';
      default: return status || '—';
    }
  }

  tagStyle(text: string | null | undefined, index: number) {
    const safeText = text || '';
    const tagPalette = [
      { bg: '#22c55e', fg: '#ffffff' },
      { bg: '#3b82f6', fg: '#ffffff' },
      { bg: '#f59e0b', fg: '#111111' },
      { bg: '#ef4444', fg: '#ffffff' },
      { bg: '#a855f7', fg: '#ffffff' },
      { bg: '#14b8a6', fg: '#ffffff' },
    ];
    let h = 0;
    for (let i = 0; i < safeText.length; i++) h = (h * 31 + safeText.charCodeAt(i)) >>> 0;
    const c = tagPalette[h % tagPalette.length];
    return { 'background-color': c.bg, color: c.fg, 'border-color': 'transparent', 'border-radius': '8px', 'font-weight': 600, 'padding': '0 .5rem' };
  }
}
