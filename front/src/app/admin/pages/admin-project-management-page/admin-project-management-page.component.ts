import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import {
  GestionAdminService,
  ServerResponseContractDTO,
  ServerResponseInvestmentDTO,
  ServerResponseEarningDTO,
  RequestAdminProjectUpdateDTO,
  RequestAdminContractUpdateDTO,
  Currency,
  ContractStatus,
  InvestmentStatus,
  EarningStatus,
  ProjectStatus
} from '../../../core/services/gestion-admin.service';

import { ProjectsService, IProject } from '../../../projects/services/projects.service';

interface ResponseContractDTO {
  idContract: number;
  projectId?: number;
  textTitle: string;
  description: string;
  amount: number;
  currency: Currency;
  status: ContractStatus | string;
  createdAt: string;
  createdByInvestorId: number;
  profit1Year?: number;
  profit2Years?: number;
  profit3Years?: number;
  investorSigned?: boolean;
  investorSignedDate?: string | null;
  studentSigned?: boolean;
  studentSignedDate?: string | null;
}

interface ResponseInvestmentDTO {
  idInvestment: number;
  projectId?: number;
  amount: number;
  currency: Currency;
  status: InvestmentStatus | string;
  createdAt: string;
  generatedById: number;
  confirmedAt?: string | null;
}

interface ResponseEarningDTO {
  idEarning: number;
  projectId?: number;
  amount: number;
  profitRate: number;
  currency: Currency;
  status: EarningStatus | string;
  createdAt: string;
  confirmedAt?: string | null;
  contractId: number;
}

@Component({
  selector: 'app-admin-project-management-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    ToolbarModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    DialogModule,
    TableModule,
    TagModule,
    ConfirmDialogModule
  ],
  templateUrl: './admin-project-management-page.component.html',
  providers: [MessageService, ConfirmationService]
})
export class AdminProjectManagementPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(MessageService);
  private adminService = inject(GestionAdminService);
  private projectsSvc = inject(ProjectsService);

  form: FormGroup;
  currentProject = signal<IProject | null>(null);

  contracts = signal<ResponseContractDTO[]>([]);
  investments = signal<ResponseInvestmentDTO[]>([]);
  earnings = signal<ResponseEarningDTO[]>([]);
  activeTab = signal<'contracts' | 'investments' | 'earnings'>('contracts');
  
  showContractModal = signal(false);
  editingContract = signal<ResponseContractDTO | null>(null);
  
  showInvestmentModal = signal(false);
  editingInvestment = signal<ResponseInvestmentDTO | null>(null);
  
  showEarningModal = signal(false);
  editingEarning = signal<ResponseEarningDTO | null>(null);

  statusOptions: ProjectStatus[] = ['PENDING_FUNDING', 'IN_PROGRESS', 'COMPLETED', 'NOT_FUNDED'];
  contractStatusOptions: ContractStatus[] = ['DRAFT', 'PARTIALLY_SIGNED', 'SIGNED', 'CANCELLED', 'REFUNDED', 'CLOSED'];
  investmentStatusOptions: InvestmentStatus[] = ['IN_PROGRESS', 'PENDING_CONFIRMATION', 'RECEIVED', 'NOT_RECEIVED', 'CANCELLED', 'PENDING_RETURN', 'RETURNED', 'COMPLETED'];
  earningStatusOptions: EarningStatus[] = ['IN_PROGRESS', 'PENDING_CONFIRMATION', 'RECEIVED', 'NOT_RECEIVED'];
  currencyOptions: Currency[] = ['USD', 'ARS', 'CNY', 'EUR'];

  constructor() {
    this.form = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      description: [''],
      budgetGoal: [null],
      status: ['PENDING_FUNDING'],
      startDate: [null],
      estimatedEndDate: [null],
      endDate: [null],
      deleted: [false]
    });
  }

  private formatDateToIso(d?: Date | string | null): string | null {
    if (!d) return null;
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const date = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(date.getTime())) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private parseBool(v: any): boolean {
    return v === true || v === 'true' || v === 1 || v === '1';
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const projectIdFromUrl = idParam ? Number(idParam) : null;

    const navProject = this.router.getCurrentNavigation()?.extras.state?.['project'];
    const historyProject = (history && (history.state as any))?.project;
    const projectFromState: IProject | null = navProject ?? historyProject ?? null;

    if (projectFromState) {
      this.patchProjectData(projectFromState);
    }

    const finalProjectId = projectFromState?.id ?? projectIdFromUrl;

    if (finalProjectId) {
      if (!projectFromState) {
        this.projectsSvc.getById(finalProjectId).subscribe({
          next: (p) => {
            if (p) this.patchProjectData(p as IProject);
            this.loadRelatedResources(finalProjectId);
          },
          error: (err) => {
            console.error(err);
            this.loadRelatedResources(finalProjectId);
          }
        });
      } else {
        this.loadRelatedResources(finalProjectId);
      }
    }
  }

  private patchProjectData(project: IProject): void {
    this.currentProject.set(project);
    const isoStart = (project as any).startDate ?? (project as any).lastUpdated ?? null;
    const isoEstimated = (project as any).estimatedEndDate ?? null;
    const isoEnd = (project as any).endDate ?? null;

    this.form.patchValue({
      id: project.id ?? null,
      name: project.title ?? '',
      description: (project as any).description ?? project.summary ?? '',
      budgetGoal: (project as any).fundingGoal ?? (project as any).budgetGoal ?? null,
      status: project.status ?? 'PENDING_FUNDING',
      startDate: isoStart,
      estimatedEndDate: isoEstimated,
      endDate: isoEnd,
      deleted: this.parseBool(project.deleted)
    });
  }

  private loadRelatedResources(projectId: number): void {
    this.fetchContracts(projectId);
    this.fetchInvestments(projectId);
    this.fetchEarnings(projectId);
  }

  private fetchContracts(projectId: number): void {
    this.adminService.getContractsByProject(projectId).subscribe(list => {
      this.contracts.set((list || []).map((l: ServerResponseContractDTO) => ({
        idContract: l.idContract,
        projectId: l.projectId,
        createdByInvestorId: l.createdByInvestorId ?? 0,
        textTitle: l.textTitle,
        description: l.description ?? '',
        amount: Number(l.amount ?? 0),
        currency: (l.currency as Currency) ?? 'USD',
        status: (l.status as ContractStatus) ?? 'SIGNED',
        createdAt: l.createdAt ?? '',
        investorSigned: !!l.investorSigned,
        investorSignedDate: l.investorSignedDate ?? null,
        studentSigned: !!l.studentSigned,
        studentSignedDate: l.studentSignedDate ?? null,
        profit1Year: l.profit1Year,
        profit2Years: l.profit2Years,
        profit3Years: l.profit3Years
      })));
    });
  }

  private fetchInvestments(projectId: number): void {
    this.adminService.getInvestmentsByProject(projectId).subscribe(list => {
      this.investments.set((list || []).map((l: ServerResponseInvestmentDTO) => ({
        idInvestment: l.idInvestment,
        projectId: l.projectId,
        amount: Number(l.amount ?? 0),
        currency: l.currency ?? 'USD',
        status: l.status,
        createdAt: l.createdAt ?? '',
        generatedById: l.generatedById ?? 0,
        confirmedAt: l.confirmedAt ?? null
      })));
    });
  }

  private fetchEarnings(projectId: number): void {
    this.adminService.getEarningsByProject(projectId).subscribe(list => {
      this.earnings.set((list || []).map((l: ServerResponseEarningDTO) => ({
        idEarning: l.idEarning,
        projectId: l.projectId,
        amount: Number(l.amount ?? 0),
        profitRate: Number(l.profitRate ?? 0),
        currency: l.currency ?? 'USD',
        status: l.status,
        createdAt: l.createdAt ?? '',
        confirmedAt: l.confirmedAt ?? null,
        contractId: l.contractId ?? 0
      })));
    });
  }

  saveProject(): void {
    if (this.form.invalid || !this.form.value.id) {
      this.toast.add({ severity: 'warn', summary: 'Validation', detail: 'Complete required fields' });
      return;
    }
    const fv = this.form.value;
    const projectId = fv.id;

    const startIso = this.formatDateToIso(fv.startDate);
    const estimatedIso = this.formatDateToIso(fv.estimatedEndDate);
    const endIso = this.formatDateToIso(fv.endDate);

    const payload: RequestAdminProjectUpdateDTO = {
      name: fv.name,
      description: fv.description,
      budgetGoal: fv.budgetGoal,
      status: fv.status,
      startDate: startIso,
      estimatedEndDate: estimatedIso,
      endDate: endIso,
      deleted: !!fv.deleted
    };

    this.adminService.updateProject(projectId, payload).subscribe({
      next: () => this.toast.add({ severity: 'success', summary: 'Success', detail: 'Project saved' }),
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save project' })
    });
  }

  openEditContract(c: ResponseContractDTO): void {
    this.editingContract.set({ ...c });
    this.showContractModal.set(true);
  }

  saveContract(): void {
    const contract = this.editingContract();
    if (!contract) return;

    const payload: RequestAdminContractUpdateDTO = {
      status: contract.status,
    } as RequestAdminContractUpdateDTO;

    this.adminService.updateContract(contract.idContract, payload).subscribe({
      next: () => {
        this.contracts.update(arr => arr.map(x => x.idContract === contract.idContract ? { ...contract } : x));
        this.showContractModal.set(false);
        this.toast.add({ severity: 'success', summary: 'Success', detail: 'Contract updated' });
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update contract' })
    });
  }

  openEditInvestment(i: ResponseInvestmentDTO): void {
    this.editingInvestment.set({ ...i });
    this.showInvestmentModal.set(true);
  }

  saveInvestment(): void {
    const investment = this.editingInvestment();
    if (!investment) return;

    this.adminService.updateInvestmentStatus(investment.idInvestment, investment.status).subscribe({
      next: () => {
        this.investments.update(arr => arr.map(x => x.idInvestment === investment.idInvestment ? { ...investment } : x));
        this.showInvestmentModal.set(false);
        this.toast.add({ severity: 'success', summary: 'Success', detail: 'Investment updated' });
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update investment' })
    });
  }

  openEditEarning(e: ResponseEarningDTO): void {
    this.editingEarning.set({ ...e });
    this.showEarningModal.set(true);
  }

  saveEarning(): void {
    const earning = this.editingEarning();
    if (!earning) return;

    this.adminService.updateEarningStatus(earning.idEarning, earning.status).subscribe({
      next: () => {
        this.earnings.update(arr => arr.map(x => x.idEarning === earning.idEarning ? { ...earning } : x));
        this.showEarningModal.set(false);
        this.toast.add({ severity: 'success', summary: 'Success', detail: 'Earning updated' });
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update earning' })
    });
  }

  goBack(): void {
    window.history.back();
  }
}
