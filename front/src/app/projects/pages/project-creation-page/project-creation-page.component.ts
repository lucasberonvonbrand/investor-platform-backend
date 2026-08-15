import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';

import { ProjectsService, CreateProjectDto } from '../../services/projects.service';
import { StudentService } from '../../../core/services/students.service';
import { AuthService } from '../../../auth/services/auth.service';
import { StudentName } from '../../../models/student-name.model';

import { ProjectBasicInfoFormComponent } from '../../components/project-basic-info-form.component';
import { ProjectDatesFormComponent } from '../../components/project-dates-form.component';
import { ProjectTeamFormComponent } from '../../components/project-team-form.component';

type StudentWithFullName = StudentName & { fullName: string };

@Component({
  selector: 'app-project-creation-page',
  standalone: true,
  templateUrl: './project-creation-page.component.html',
  styles: [`
    .loading-overlay {
      position: absolute;
      inset: 0;
      background-color: rgba(255, 255, 255, 0.9);
      display: flex; flex-direction: column;
      justify-content: center; align-items: center;
      text-align: center; z-index: 1000;
    }
    .loading-content h3 { font-size: 1.5rem; color: #333; }
    .loading-content p { color: #666; }
    .progress-bar {
      width: 80%; height: 10px; background-color: #e0e0e0;
      border-radius: 5px; overflow: hidden; margin-top: 20px;
    }
    .progress-bar-fill {
      height: 100%; background-color: #4CAF50; width: 0; transition: width 0.3s ease;
    }
    :global(.app-dark) .loading-overlay { background-color: rgba(17, 24, 39, 0.9); }
    :global(.app-dark) .loading-content h3 { color: #f3f4f6; }
    :global(.app-dark) .loading-content p { color: #9ca3af; }
    :global(.app-dark) .progress-bar { background-color: #374151; }
  `],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToastModule,
    CardModule,
    ButtonModule,
    ProjectBasicInfoFormComponent,
    ProjectDatesFormComponent,
    ProjectTeamFormComponent
  ],
  providers: [MessageService],
})
export class ProjectCreationPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private projectsSrv = inject(ProjectsService);
  private studentSrv = inject(StudentService);
  private msg = inject(MessageService);
  private authSvc = inject(AuthService);

  projectForm!: FormGroup;

  isLoading = signal(false);
  progress = signal(0);
  
  allStudents = signal<StudentWithFullName[]>([]);
  studentsLoading = signal(false);
  suggestionsStudents = signal<StudentWithFullName[]>([]);

  ngOnInit(): void {
    const currentUser = this.authSvc.getSession();
    const ownerForForm: StudentWithFullName | null = currentUser
      ? {
          id: currentUser.id,
          firstName: currentUser.username,
          lastName: '',
          fullName: currentUser.username,
        }
      : null;

    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      budgetGoal: [null, [Validators.required, Validators.min(0)]],
      startDate: ['', Validators.required],
      estimatedEndDate: ['', Validators.required],
      owner: [{ value: ownerForForm, disabled: true }, Validators.required],
      students: [[] as StudentWithFullName[]],
      projectTagName: ['', Validators.required],
    });
  }

  private normalize(list: StudentName[]): StudentWithFullName[] {
    return (list ?? []).map((s) => ({
      ...s,
      fullName: (`${s.firstName ?? ''} ${s.lastName ?? ''}`).trim(),
    }));
  }

  private fetchNames(q: string, onDone: (arr: StudentWithFullName[]) => void): void {
    this.studentSrv.getNames(q).subscribe({
      next: (list) => {
        let arr = this.normalize(list);
        if (arr.length === 0 && q === '') {
          this.studentSrv.getNames('a').subscribe({
            next: (list2) => onDone(this.normalize(list2)),
            error: () => onDone([]),
          });
        } else {
          onDone(arr);
        }
      },
      error: () => onDone([]),
    });
  }

  showAllStudents(): void {
    this.studentsLoading.set(true);
    this.fetchNames('', (arr) => {
      this.suggestionsStudents.set(arr.slice(0, 50));
      this.allStudents.set(arr);
      this.studentsLoading.set(false);
    });
  }

  completeStudents(e: { query: string }): void {
    this.studentsLoading.set(true);
    const q = (e?.query ?? '').trim();
    this.fetchNames(q, (arr) => {
      this.suggestionsStudents.set(arr);
      this.studentsLoading.set(false);
    });
  }

  private handleServerValidation(err: unknown): string[] {
    if (!(err instanceof HttpErrorResponse)) return [];
    let payload: any = err.error;

    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        payload = { message: payload };
      }
    }

    let messages: string[] = [];
    if (Array.isArray(payload)) {
      messages = payload.map((x) => String(x?.message ?? x));
    } else if (payload?.errors && typeof payload.errors === 'object') {
      for (const [field, arr] of Object.entries(payload.errors)) {
        const list = Array.isArray(arr) ? arr : [arr];
        for (const raw of list) {
          messages.push(`${field}: ${raw}`);
        }
      }
    } else if (payload?.message) {
      messages = String(payload.message).split(/(?<=\.)\s+|;|\n/).map((s: string) => s.trim()).filter(Boolean);
    }

    const controlByName: Record<string, string> = {
      'name': 'name',
      'description': 'description',
      'budgetGoal': 'budgetGoal',
      'startDate': 'startDate',
      'estimatedEndDate': 'estimatedEndDate',
      'ownerId': 'owner',
      'studentIds': 'students',
    };

    for (const raw of messages) {
      const match = raw.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        const field = match[1].trim();
        const onlyMsg = match[2].trim();
        const ctlName = controlByName[field];
        if (ctlName && this.projectForm.get(ctlName)) {
          this.projectForm.get(ctlName)?.setErrors({ server: onlyMsg });
          this.projectForm.get(ctlName)?.markAsTouched();
        }
      }
    }
    return messages;
  }

  onCancel(): void {
    this.projectForm.reset();
  }

  onSubmit(): void {
    if (this.projectForm.invalid) return;

    const v = this.projectForm.getRawValue() as {
      name: string;
      description: string;
      budgetGoal: number | null;
      startDate: string;
      estimatedEndDate: string;
      owner: StudentWithFullName | null;
      students: StudentWithFullName[];
      projectTagName: string;
    };

    if (!v.owner) {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'Could not determine project leader.', life: 6000 });
      return;
    }

    const dto: CreateProjectDto = {
      name: v.name,
      description: v.description,
      budgetGoal: Number(v.budgetGoal ?? 0),
      startDate: v.startDate,
      estimatedEndDate: v.estimatedEndDate,
      ownerId: v.owner.id,
      studentIds: (v.students ?? []).map((s) => s.id),
      projectTagName: v.projectTagName,
    };

    this.isLoading.set(true);
    this.progress.set(0);
    const prog = setInterval(() => {
      this.progress.update(p => Math.min(95, p + 7));
    }, 200);

    this.projectsSrv.create(dto).subscribe({
      next: () => {
        clearInterval(prog);
        this.progress.set(100);
        this.msg.add({ severity: 'success', summary: 'Success', detail: 'Project created successfully.', life: 3500 });
        setTimeout(() => {
          this.isLoading.set(false);
          this.projectForm.reset();
          this.suggestionsStudents.set([]);
        }, 300);
      },
      error: (err: unknown) => {
        clearInterval(prog);
        this.isLoading.set(false);
        const details = this.handleServerValidation(err);
        if (details.length) {
          this.msg.add({ severity: 'error', summary: 'Validation Error', detail: details.join('\n'), life: 6000 });
        } else {
          this.msg.add({ severity: 'error', summary: 'Error', detail: 'Could not create project.', life: 4000 });
        }
      },
    });
  }
}
