import { Component, input, effect, signal, inject, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';
import { EditorModule } from 'primeng/editor';
import { MenuModule } from 'primeng/menu';
import { StepsModule } from 'primeng/steps';
import { MenuItem, ConfirmationService, MessageService } from 'primeng/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { ProjectDetailsService, IContract, IInvestment, IEarning } from '../../services/project-details.service';
import { IMyProject } from '../../services/my-projects.service';
import { AuthService } from '../../../auth/services/auth.service';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

interface IInvestmentWithRetries extends IInvestment { retriesLeft?: number; }

@Component({
  standalone: true,
  selector: 'app-project-contracts',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, CardModule, ButtonModule, TableModule, TagModule,
    TooltipModule, DialogModule, ToastModule, ConfirmDialogModule, InputNumberModule, InputTextModule,
    SliderModule, EditorModule, MenuModule, StepsModule, SafeHtmlPipe
  ],
  templateUrl: './project-contracts.component.html',
  styles: [`
    :host ::ng-deep .p-dialog .p-dialog-header {
      background-color: #090f1d !important;
      color: #ffffff !important;
      border-bottom: 1px solid #1e293b !important;
      padding: 1.25rem 1.5rem !important;
    }
    :host ::ng-deep .p-dialog .p-dialog-content {
      background-color: #090f1d !important;
      color: #f8fafc !important;
      padding: 1.5rem !important;
    }
    :host ::ng-deep .p-dialog .p-dialog-footer {
      background-color: #090f1d !important;
      border-top: 1px solid #1e293b !important;
      padding: 1rem 1.5rem !important;
    }
    :host ::ng-deep .ql-toolbar {
      background-color: #0d1527 !important;
      border-color: #1e293b !important;
      border-top-left-radius: 0.75rem;
      border-top-right-radius: 0.75rem;
    }
    :host ::ng-deep .ql-stroke {
      stroke: #a78bfa !important;
    }
    :host ::ng-deep .ql-fill {
      fill: #a78bfa !important;
    }
    :host ::ng-deep .ql-picker-label {
      color: #e2e8f0 !important;
    }
    :host ::ng-deep .ql-container {
      background-color: #121c33 !important;
      border-color: #1e293b !important;
      color: #f8fafc !important;
      border-bottom-left-radius: 0.75rem;
      border-bottom-right-radius: 0.75rem;
      font-family: inherit;
    }
    :host ::ng-deep .ql-editor {
      min-height: 180px;
      color: #f8fafc !important;
    }
    :host ::ng-deep .p-slider {
      background-color: #1e293b !important;
    }
    :host ::ng-deep .p-slider .p-slider-range {
      background-color: #7c3aed !important;
    }
    :host ::ng-deep .p-slider .p-slider-handle {
      background-color: #a78bfa !important;
      border-color: #7c3aed !important;
    }
    :host ::ng-deep .p-inputnumber-input {
      background-color: #121c33 !important;
      color: #ffffff !important;
      border-color: #1e293b !important;
    }
  `],
  providers: [MessageService, ConfirmationService]
})
export class ProjectContractsComponent {
  project = input.required<IMyProject | null>();
  isOwner = input.required<boolean>();
  isInvestor = input.required<boolean>();

  private svc = inject(ProjectDetailsService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private toast = inject(MessageService);
  private confirmSvc = inject(ConfirmationService);

  currentUser = this.auth.getSession();

  @ViewChild('contractContent') contractContentRef!: ElementRef<HTMLDivElement>;

  contracts = signal<IContract[]>([]);
  loading = signal(false);

  // ===== Contract Modal States =====
  contractModalVisible = signal(false);
  editing = signal<IContract | null>(null);
  isReadonly = signal(false);
  viewingOnly = signal<IContract | null>(null);
  showEditor = signal(false);

  currentContractStatus = computed<IContract['status'] | 'PENDING_STUDENT_SIGNATURE'>(() => {
    const contractInView = this.viewingOnly() || this.reviewingToSign() || this.editing();
    return contractInView?.status || 'PENDING_STUDENT_SIGNATURE';
  });
  currentContractStatusLabel = computed(() => this.getContractStatusLabel(this.currentContractStatus()));

  reviewingToSign = signal<IContract | null>(null);
  currencyOptions = [
    { label: 'Dólar Estadounidense', value: 'USD' },
    { label: 'Peso Argentino', value: 'ARS' },
    { label: 'Euro', value: 'EUR' },
    { label: 'Yuan Chino', value: 'CNY' }
  ];

  contractForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    currency: ['USD', Validators.required],
    profit1Year: [10, [Validators.required, Validators.min(0), Validators.max(100)]],
    profit2Years: [15, [Validators.required, Validators.min(0), Validators.max(100)]],
    profit3Years: [20, [Validators.required, Validators.min(0), Validators.max(100)]],
    description: [''],
  });

  contractTemplates: MenuItem[] = [];

  // ===== Payments / Transactions Modal =====
  transactionModalVisible = signal(false);
  isProcessingTransaction = signal(false);
  selectedContractForTransactions = signal<IContract | null>(null);

  // ===== Earnings Modal =====
  earningModalVisible = signal(false);
  isProcessingEarning = signal(false);
  selectedContractForEarnings = signal<IContract | null>(null);

  // ===== Contract Lifecycle Steps =====
  contractLifecycleSteps = computed<MenuItem[]>(() => {
    return [
      { label: 'Borrador', id: 'DRAFT' },
      { label: 'Aprobado', id: 'PARTIALLY_SIGNED' },
      { label: 'Firmado', id: 'SIGNED' },
      { label: 'Cerrado', id: 'CLOSED' },
    ];
  });

  contractLifecycleActiveIndex = computed<number>(() => {
    const contract = this.viewingOnly() || this.reviewingToSign() || this.editing();
    if (!contract) return -1;

    const currentStatus = contract.status;
    switch (currentStatus) {
      case 'DRAFT': return 0;
      case 'PARTIALLY_SIGNED': return 1;
      case 'SIGNED': return 2;
      case 'CLOSED': return 3;
      default: return -1;
    }
  });

  // ===== Investment Lifecycle Steps =====
  investmentLifecycleSteps = computed<MenuItem[]>(() => {
    return [
      { label: 'Pendiente', id: 'IN_PROGRESS' },
      { label: 'Enviado', id: 'PENDING_CONFIRMATION' },
      { label: 'Recibido', id: 'RECEIVED' },
    ];
  });

  investmentLifecycleActiveIndex = computed<number>(() => {
    const contract = this.selectedContractForTransactions();
    if (!contract || !contract.investment) return -1;

    const currentStatus = contract.investment.status;
    switch (currentStatus) {
      case 'IN_PROGRESS': return 0;
      case 'PENDING_CONFIRMATION': return 1;
      case 'RECEIVED':
      case 'COMPLETED': return 2;
      default: return -1;
    }
  });

  // ===== Earning Lifecycle Steps =====
  earningLifecycleSteps = computed<MenuItem[]>(() => {
    return [
      { label: 'Generado', id: 'IN_PROGRESS' },
      { label: 'Enviado', id: 'PENDING_CONFIRMATION' },
      { label: 'Recibido', id: 'RECEIVED' },
    ];
  });

  constructor() {
    effect(() => {
      const p = this.project();
      if (p?.id) {
        this.loadContracts(p.id);
        this.setupContractTemplates();
      }
    });
  }

  loadContracts(projectId: number): void {
    this.loading.set(true);
    const id = this.currentUser?.id;
    if (!id) {
      this.loading.set(false);
      return;
    }

    const req$ = this.isInvestor()
      ? this.svc.getContractsByInvestorAndProject(id, projectId)
      : this.svc.getContracts(projectId);

    req$.subscribe({
      next: (list) => this.contracts.set(list),
      error: () => {
        this.loading.set(false);
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load contracts' });
      },
      complete: () => this.loading.set(false)
    });
  }

  openCreateContract(): void {
    if (!this.isInvestor()) return;
    this.editing.set(null);
    this.showEditor.set(false);
    this.isReadonly.set(false);
    this.contractForm.reset({
      title: '',
      amount: 1000,
      currency: 'USD',
      description: '',
      profit1Year: 10,
      profit2Years: 15,
      profit3Years: 20,
    });
    this.contractModalVisible.set(true);
    setTimeout(() => this.showEditor.set(true), 0);
  }

  editContract(row: IContract): void {
    if (!this.isInvestor() && !(this.isOwner() && row.status === 'DRAFT')) return;

    this.editing.set(row);
    this.isReadonly.set(false);
    this.showEditor.set(false);

    const formValues = this.getContractFormValues(row);
    this.contractForm.patchValue(formValues);
    this.contractModalVisible.set(true);

    setTimeout(() => {
      this.showEditor.set(true);
      this.contractForm.controls.description.setValue(formValues.description);
    }, 0);
  }

  viewContract(contract: IContract): void {
    this.viewingOnly.set(contract);
    this.isReadonly.set(true);
    this.showEditor.set(false);

    const formValues = this.getContractFormValues(contract);
    this.contractForm.patchValue(formValues);
    this.contractModalVisible.set(true);

    setTimeout(() => {
      this.showEditor.set(true);
      this.contractForm.controls.description.setValue(formValues.description);
    }, 0);
  }

  cancelEdit(): void {
    this.contractModalVisible.set(false);
    this.showEditor.set(false);
    this.editing.set(null);
    this.reviewingToSign.set(null);
    this.viewingOnly.set(null);
    this.isReadonly.set(false);
  }

  private getContractFormValues(contract: IContract) {
    return {
      title: contract.textTitle ?? '',
      amount: contract.amount,
      currency: contract.currency ?? 'USD',
      profit1Year: contract.profit1Year ? Number(contract.profit1Year) * 100 : 0,
      profit2Years: contract.profit2Years ? Number(contract.profit2Years) * 100 : 0,
      profit3Years: contract.profit3Years ? Number(contract.profit3Years) * 100 : 0,
      description: contract.description ?? ''
    };
  }

  saveContract(): void {
    const reviewingContract = this.reviewingToSign();
    if (reviewingContract) {
      this.confirmAndSign(reviewingContract);
      return;
    }

    if (this.contractForm.invalid) return;

    const raw = this.contractForm.getRawValue();
    const commonPayload = {
      textTitle: raw.title,
      description: raw.description,
      amount: raw.amount,
      currency: raw.currency as IContract['currency'],
      profit1Year: raw.profit1Year / 100,
      profit2Years: raw.profit2Years / 100,
      profit3Years: raw.profit3Years / 100,
    };

    const editValue = this.editing();
    if (this.isInvestor()) {
      if (editValue) {
        const payload = { ...commonPayload, investorId: this.currentUser?.id };
        this.svc.updateContractByInvestor(editValue.idContract, payload).subscribe(this.getObserver());
      } else {
        const payload = {
          ...commonPayload,
          projectId: this.project()!.id,
          createdByInvestorId: this.currentUser?.id,
        };
        this.svc.upsertContract(payload).subscribe(this.getObserver());
      }
    } else if (this.isOwner()) {
      if (editValue) {
        const payload = { ...commonPayload, studentId: this.currentUser?.id };
        this.svc.updateContractByStudent(editValue.idContract, payload).subscribe(this.getObserver());
      } else {
        this.toast.add({ severity: 'error', summary: 'Acción no permitida', detail: 'Solo los inversores pueden crear nuevos contratos.' });
      }
    }
  }

  private getObserver() {
    return {
      next: (saved: IContract) => {
        if (this.editing()) {
          this.updateContractInList(saved);
        } else {
          this.contracts.update(list => [saved, ...list]);
        }
        this.toast.add({ severity: 'success', summary: 'Contrato', detail: this.editing() ? 'Actualizado' : 'Creado', life: 1600 });
        this.cancelEdit();
      },
      error: (err: any) => {
        let detail = err?.error?.message || 'No se pudo guardar el contrato.';
        if (typeof detail === 'string' && detail.includes("Data too long for column 'description'")) {
          detail = 'El contenido de las cláusulas es demasiado largo. Por favor, reduce el texto o el formato.';
        }
        this.toast.add({ severity: 'error', summary: 'Error al guardar', detail: detail, life: 6000 });
      }
    };
  }

  calculateProfit(baseAmount: number | null | undefined, percentage: number | null | undefined): number {
    if (baseAmount == null || percentage == null) {
      return 0;
    }
    return (baseAmount * percentage) / 100;
  }

  private setupContractTemplates(): void {
    const projectTitle = this.project()?.title ?? 'CardioPulse Wearable';
    const currentDate = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    this.contractTemplates = [
      {
        label: '1. Inversión Semilla y Desarrollo Inicial',
        icon: 'pi pi-file',
        command: () => {
          const template = `
            <h1><strong>CONTRATO DE INVERSIÓN SEMILLA</strong></h1>
            <p>En la ciudad de Buenos Aires, a ${currentDate}.</p>
            <br>
            <h2><strong>1. PARTES INTERVINIENTES</strong></h2>
            <p><strong>DE UNA PARTE:</strong> El Inversor registrado en la plataforma Proy+, actuando en su propio nombre ("El Inversor").</p>
            <p><strong>DE OTRA PARTE:</strong> El equipo emprendedor del proyecto <strong>${projectTitle}</strong>, representado por sus estudiantes fundadores de la UTN ("El Equipo Emprendedor").</p>
            <br>
            <h2><strong>2. OBJETO DEL CONTRATO</strong></h2>
            <p>El Inversor acuerda aportar el capital estipulado destinado exclusivamente al financiamiento del lote de prototipos de prueba, componentes electrónicos de electrocardiografía (ECG) y trámites iniciales de homologación regulatoria ante ANMAT.</p>
            <br>
            <h2><strong>3. TÉRMINOS Y RETORNO DE INVERSIÓN</strong></h2>
            <p>El Equipo Emprendedor se compromete a abonar los retornos sobre el capital invertido conforme a las proyecciones de rentabilidad acordadas en la plataforma.</p>
            <br>
            <h2><strong>4. COMPROMISOS Y SUPERVISIÓN</strong></h2>
            <p>El Equipo Emprendedor presentará informes trimestrales de avance técnico y financiero a través del módulo de seguimiento de Proy+. Todos los pagos y devoluciones se procesarán dentro de los flujos guiados de la plataforma.</p>
          `;
          this.contractForm.controls.description.setValue(template);
          this.contractForm.patchValue({
            title: 'Contrato de Inversión Semilla - CardioPulse Wearable',
            amount: 10000,
            currency: 'USD',
            profit1Year: 12,
            profit2Years: 18,
            profit3Years: 25
          });
        }
      },
      {
        label: '2. Nota Convertible y Escalado Clínico',
        icon: 'pi pi-file-edit',
        command: () => {
          const template = `
            <h1><strong>ACUERDO DE NOTA CONVERTIBLE Y ESCALADO CLÍNICO</strong></h1>
            <p>En la ciudad de Buenos Aires, a ${currentDate}.</p>
            <br>
            <h2><strong>1. PROPÓSITO DEL ACUERDO</strong></h2>
            <p>Este acuerdo establece las bases para la conversión de deuda convertible en equity/participación societaria tras la culminación exitosa de las pruebas de campo en centros de salud asociados para el proyecto <strong>${projectTitle}</strong>.</p>
            <br>
            <h2><strong>2. APORTE DE CAPITAL Y CONDICIONES</strong></h2>
            <p>El Inversor inyecta capital de trabajo. En caso de una ronda posterior de financiamiento Serie A o valuación institucional, el inversor tendrá derecho de conversión preferente con un descuento del 15% sobre el valor por acción.</p>
            <br>
            <h2><strong>3. CALENDARIO DE DEVOLUCIÓN O CONVERSIÓN</strong></h2>
            <p>Si la conversión no se ejecuta al término del año 3, el proyecto reembolsará el saldo principal más los intereses acordados en cuotas semestrales.</p>
            <br>
            <h2><strong>4. GARANTÍA Y CONFIDENCIALIDAD</strong></h2>
            <p>Se garantiza la confidencialidad de los algoritmos de IA y del diseño esquemático del circuito impreso (PCB) bajo acuerdo NDA vinculado.</p>
          `;
          this.contractForm.controls.description.setValue(template);
          this.contractForm.patchValue({
            title: 'Nota Convertible y Alianza de Escalado Clínico',
            amount: 12000,
            currency: 'USD',
            profit1Year: 10,
            profit2Years: 15,
            profit3Years: 22
          });
        }
      }
    ];
  }

  agreeToContractTerms(contract: IContract): void {
    this.confirmSvc.confirm({
      message: '¿Estás seguro de que quieres aprobar los términos de este borrador? Una vez aprobado, el contrato se bloqueará para su edición y pasará a la fase de firma.',
      header: 'Confirmar Aprobación de Términos',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Sí, aprobar',
      rejectLabel: 'No',
      accept: () => {
        if (this.isInvestor()) {
          const investorId = this.currentUser?.id;
          if (!investorId) return;
          this.svc.agreeToContractByInvestor(contract.idContract, investorId).subscribe({
            next: (updated) => {
              this.updateContractInList(updated);
              this.cancelEdit();
            },
            error: (err) => this.toast.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo aprobar el contrato.' })
          });
        } else if (this.isOwner()) {
          const studentId = this.currentUser?.id;
          if (!studentId) return;
          this.svc.agreeToContractByStudent(contract.idContract, studentId).subscribe({
            next: (updated) => {
              this.updateContractInList(updated);
              this.cancelEdit();
            },
            error: (err) => this.toast.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo aprobar el contrato.' })
          });
        }
      }
    });
  }

  rejectContract(contract: IContract): void {
    this.confirmSvc.confirm({
      message: `¿Estás seguro de que quieres rechazar el contrato "${contract.textTitle}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar Rechazo',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, rechazar',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const studentId = this.currentUser?.id;
        if (!studentId) return;
        this.svc.cancelContractByStudent(contract.idContract, studentId).subscribe({
          next: (updatedContract) => {
            this.updateContractInList(updatedContract);
            this.toast.add({ severity: 'warn', summary: 'Rechazado', detail: 'El contrato ha sido rechazado.' });
            this.cancelEdit();
          },
          error: (err) => this.toast.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo rechazar el contrato.' })
        });
      }
    });
  }

  signContract(contract: IContract): void {
    if (!this.currentUser) return;
    this.confirmSvc.confirm({
      message: `Estás a punto de firmar el contrato "${contract.textTitle}". Esta acción es legalmente vinculante. ¿Estás seguro de continuar?`,
      header: 'Confirmar Firma Final',
      icon: 'pi pi-file-edit',
      acceptLabel: 'Sí, Firmar Contrato',
      rejectLabel: 'No',
      accept: () => {
        if (this.isInvestor()) {
          this.svc.signContractByInvestor(contract.idContract, this.currentUser!.id).subscribe({
            next: (updated) => {
              this.toast.add({ severity: 'success', summary: 'Success', detail: 'Contract signed' });
              this.updateContractInList(updated);
            },
            error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Could not sign contract' })
          });
        } else if (this.isOwner()) {
          this.svc.signContractByStudent(contract.idContract, this.currentUser!.id).subscribe({
            next: (updated) => {
              this.toast.add({ severity: 'success', summary: 'Success', detail: 'Contract signed' });
              this.updateContractInList(updated);
            },
            error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Could not sign contract' })
          });
        }
      }
    });
  }

  reviewAndSignContract(contract: IContract): void {
    this.reviewingToSign.set(contract);
    this.isReadonly.set(true);
    this.showEditor.set(false);

    const formValues = this.getContractFormValues(contract);
    this.contractForm.patchValue(formValues);
    this.contractModalVisible.set(true);

    setTimeout(() => {
      this.showEditor.set(true);
      this.contractForm.controls.description.setValue(formValues.description);
    }, 0);
  }

  private confirmAndSign(contract: IContract): void {
    const studentId = this.currentUser?.id;
    if (!studentId) return;

    this.confirmSvc.confirm({
      message: `¿Estás seguro de que quieres firmar y aceptar los términos del contrato "${contract.textTitle}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar Firma de Contrato',
      icon: 'pi pi-file-edit',
      acceptLabel: 'Sí, firmar',
      rejectLabel: 'No',
      accept: () => {
        this.svc.signContractByStudent(contract.idContract, studentId).subscribe({
          next: (updatedContract) => {
            this.updateContractInList(updatedContract);
            this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Contrato firmado correctamente.' });
            this.cancelEdit();
          },
          error: (err) => this.toast.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo firmar el contrato.' })
        });
      }
    });
  }

  cancelContractByInvestor(contract: IContract): void {
    if (!this.currentUser) return;
    this.confirmSvc.confirm({
      message: 'Are you sure you want to withdraw your offer?',
      accept: () => {
        this.svc.cancelContractByInvestor(contract.idContract, this.currentUser!.id).subscribe({
          next: (updatedContract) => {
            this.toast.add({ severity: 'success', summary: 'Success', detail: 'Offer withdrawn' });
            this.updateContractInList(updatedContract);
          },
          error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Could not withdraw offer' })
        });
      }
    });
  }

  openTransactionModal(contract: IContract): void {
    this.selectedContractForTransactions.set(contract);
    this.transactionModalVisible.set(true);
  }

  closeContract(contract: IContract): void {
    if (!this.currentUser) return;
    this.confirmSvc.confirm({
      message: '¿Estás seguro de que quieres cerrar este contrato? Una vez cerrado, pasará a la fase de ganancias.',
      header: 'Cerrar Contrato',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cerrar contrato',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.svc.closeContract(contract.idContract, this.currentUser!.id).subscribe({
          next: (updated) => {
            this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'El contrato ha sido cerrado correctamente.' });
            this.updateContractInList(updated);
          },
          error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cerrar el contrato.' })
        });
      }
    });
  }

  openEarningModal(contract: IContract): void {
    this.isProcessingEarning.set(true);
    this.selectedContractForEarnings.set(contract);
    this.earningModalVisible.set(true);

    this.svc.getEarningsByContractId(contract.idContract).subscribe({
      next: (earnings) => {
        this.selectedContractForEarnings.update(c => c ? { ...c, earnings } : null);
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los detalles de la ganancia.' }),
      complete: () => this.isProcessingEarning.set(false)
    });
  }

  confirmInvestmentPaymentSent(investmentId: number): void {
    const investorId = this.currentUser?.id;
    if (!investorId) return;

    this.confirmSvc.confirm({
      message: '¿Estás seguro de que quieres notificar el envío de los fondos? Esta acción no se puede deshacer.',
      header: 'Confirmar Envío de Inversión',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, he enviado los fondos',
      rejectLabel: 'No, cancelar',
      accept: () => {
        this.isProcessingTransaction.set(true);
        this.svc.confirmInvestmentPaymentSent(investmentId, investorId).subscribe({
          next: (updatedInvestment: IInvestment) => {
            this.toast.add({
              severity: 'success',
              summary: 'Notificación Enviada',
              detail: 'Se ha notificado al estudiante sobre el envío de los fondos.'
            });
            this.updateInvestmentInContract(investmentId, updatedInvestment);
            this.transactionModalVisible.set(false);
          },
          error: (err: any) => {
            this.isProcessingTransaction.set(false);
            this.toast.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo notificar el envío.' });
          },
          complete: () => this.isProcessingTransaction.set(false)
        });
      }
    });
  }

  confirmInvestmentReceipt(investmentId: number): void {
    const studentId = this.currentUser?.id;
    if (!studentId) return;

    this.confirmSvc.confirm({
      message: '¿Estás seguro de que quieres confirmar la recepción de los fondos? Esta acción es irreversible.',
      header: 'Confirmar Recepción de Fondos',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Sí, he recibido los fondos',
      rejectLabel: 'No, cancelar',
      accept: () => {
        this.isProcessingTransaction.set(true);
        this.svc.confirmInvestmentReceipt(investmentId, studentId).subscribe({
          next: (updatedInvestment: IInvestment) => {
            this.toast.add({
              severity: 'success',
              summary: 'Recepción Confirmada',
              detail: 'Se ha confirmado la recepción del dinero y se ha notificado al inversor.'
            });
            this.updateInvestmentInContract(investmentId, updatedInvestment);
          },
          error: (err: any) => {
            this.toast.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo confirmar la recepción.' });
          },
          complete: () => this.isProcessingTransaction.set(false)
        });
      }
    });
  }

  markInvestmentAsNotReceived(investmentId: number): void {
    const studentId = this.currentUser?.id;
    if (!studentId) return;

    this.confirmSvc.confirm({
      message: '¿Estás seguro de que quieres marcar esta inversión como NO recibida? Esto cancelará el contrato asociado.',
      header: 'Confirmar No Recepción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, no la recibí',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.isProcessingTransaction.set(true);
        this.svc.markInvestmentAsNotReceived(investmentId, studentId).subscribe({
          next: (updatedInvestment: IInvestment) => {
            this.toast.add({
              severity: 'warn',
              summary: 'Operación Registrada',
              detail: 'Se ha notificado al inversor sobre la no recepción de los fondos.'
            });
            this.updateInvestmentInContract(investmentId, updatedInvestment);
          },
          error: (err: any) => {
            this.toast.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo marcar como no recibida.' });
          },
          complete: () => this.isProcessingTransaction.set(false),
        });
      }
    });
  }

  retryInvestmentPayment(investmentId: number): void {
    const investorId = this.currentUser?.id;
    if (!investorId) return;

    this.confirmSvc.confirm({
      message: 'Esto reiniciará el proceso de pago para esta inversión, permitiéndote notificar el envío nuevamente. ¿Estás seguro?',
      header: 'Confirmar Reintento de Envío',
      icon: 'pi pi-replay',
      acceptLabel: 'Sí, reintentar',
      rejectLabel: 'No, cancelar',
      accept: () => {
        this.isProcessingTransaction.set(true);
        this.svc.confirmInvestmentPaymentSent(investmentId, investorId).subscribe({
          next: (updatedInvestment: IInvestmentWithRetries) => {
            this.updateInvestmentInContract(investmentId, updatedInvestment);
            this.toast.add({
              severity: 'info',
              summary: 'Proceso Reiniciado',
              detail: 'Puedes notificar el envío de la inversión nuevamente.'
            });
            this.transactionModalVisible.set(false);
          },
          error: (err: any) => {
            this.toast.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo reiniciar el proceso.' });
          },
          complete: () => this.isProcessingTransaction.set(false)
        });
      }
    });
  }

  private updateInvestmentInContract(investmentId: number, updatedInvestment: IInvestmentWithRetries): void {
    this.contracts.update(list => list.map(c => {
      if (c.investment?.idInvestment === investmentId) {
        const newContractStatus = updatedInvestment.status === 'CANCELLED' ? 'CANCELLED' : c.status;
        const updatedContract = { ...c, investment: updatedInvestment, status: newContractStatus };

        // Update the open modal if it is viewing this contract
        const currentSelected = this.selectedContractForTransactions();
        if (currentSelected && currentSelected.idContract === c.idContract) {
          this.selectedContractForTransactions.set(updatedContract);
        }

        return updatedContract;
      }
      return c;
    }));
  }

  confirmEarningPaymentSent(earningId: number): void {
    const studentId = this.currentUser?.id;
    if (!studentId) return;

    this.confirmSvc.confirm({
      message: '¿Estás seguro de que quieres notificar el envío de la ganancia al inversor? Esta acción es irreversible.',
      header: 'Confirmar Envío de Ganancia',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, he enviado la ganancia',
      rejectLabel: 'No, cancelar',
      accept: () => {
        this.isProcessingEarning.set(true);
        this.svc.confirmEarningPaymentSent(earningId, studentId).subscribe({
          next: (updatedEarning: IEarning) => {
            this.updateEarningInContract(earningId, updatedEarning);
            this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Se ha notificado el envío de la ganancia.' });
            this.earningModalVisible.set(false);
          },
          error: (err: any) => this.toast.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo notificar el envío de la ganancia.' }),
          complete: () => this.isProcessingEarning.set(false)
        });
      }
    });
  }

  confirmEarningReceipt(earningId: number): void {
    const investorId = this.currentUser?.id;
    if (!investorId) return;

    this.confirmSvc.confirm({
      message: '¿Estás seguro de que quieres confirmar la recepción de la ganancia? Esta acción es irreversible.',
      header: 'Confirmar Recepción de Ganancia',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Sí, he recibido la ganancia',
      rejectLabel: 'No, cancelar',
      accept: () => {
        this.isProcessingEarning.set(true);
        this.svc.confirmEarningReceipt(earningId, investorId).subscribe({
          next: (updatedEarning: IEarning) => {
            this.updateEarningInContract(earningId, updatedEarning);
            this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Se ha confirmado la recepción de la ganancia.' });
            this.earningModalVisible.set(false);
          },
          error: (err: any) => this.toast.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo confirmar la recepción de la ganancia.' }),
          complete: () => this.isProcessingEarning.set(false)
        });
      }
    });
  }

  markEarningAsNotReceived(earningId: number): void {
    const investorId = this.currentUser?.id;
    if (!investorId) return;

    this.confirmSvc.confirm({
      message: '¿Estás seguro de que quieres marcar esta ganancia como NO recibida? Esto notificará al estudiante.',
      header: 'Confirmar No Recepción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, no la recibí',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.isProcessingEarning.set(true);
        this.svc.markEarningAsNotReceived(earningId, investorId).subscribe({
          next: (updatedEarning: IEarning) => {
            this.updateEarningInContract(earningId, updatedEarning);
            this.toast.add({ severity: 'warn', summary: 'Registrado', detail: 'Se ha marcado la ganancia como no recibida.' });
            this.earningModalVisible.set(false);
          },
          error: (err: any) => this.toast.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo realizar la acción.' }),
          complete: () => this.isProcessingEarning.set(false)
        });
      }
    });
  }

  retryEarningPayment(earningId: number): void {
    const studentId = this.currentUser?.id;
    if (!studentId) return;

    this.confirmSvc.confirm({
      message: 'Esto reiniciará el proceso de pago para esta ganancia, permitiéndote notificar el envío nuevamente. ¿Estás seguro?',
      header: 'Confirmar Reintento de Envío',
      icon: 'pi pi-replay',
      acceptLabel: 'Sí, reintentar',
      rejectLabel: 'No, cancelar',
      accept: () => {
        this.isProcessingEarning.set(true);
        this.svc.confirmEarningPaymentSent(earningId, studentId).subscribe({
          next: (updatedEarning: IEarning) => {
            this.updateEarningInContract(earningId, updatedEarning);
            this.toast.add({ severity: 'info', summary: 'Proceso Reiniciado', detail: 'Puedes notificar el envío de la ganancia nuevamente.' });
            this.earningModalVisible.set(false);
          },
          error: (err: any) => this.toast.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo reiniciar el proceso.' }),
          complete: () => this.isProcessingEarning.set(false)
        });
      }
    });
  }

  private updateEarningInContract(earningId: number, updatedEarning: IEarning): void {
    this.contracts.update(list => list.map(c => {
      const earningIndex = c.earnings?.findIndex(e => e.idEarning === earningId);
      if (earningIndex !== undefined && earningIndex > -1) {
        const newEarnings = [...c.earnings!];
        newEarnings[earningIndex] = updatedEarning;
        const updatedContract = { ...c, earnings: newEarnings };

        // Update the open modal if it is viewing this contract
        const currentSelected = this.selectedContractForEarnings();
        if (currentSelected && currentSelected.idContract === c.idContract) {
          this.selectedContractForEarnings.set(updatedContract);
        }

        return updatedContract;
      }
      return c;
    }));
  }

  earningLifecycleActiveIndex(earning: IEarning): number {
    if (!earning) return -1;
    switch (earning.status) {
      case 'IN_PROGRESS': return 0;
      case 'PENDING_CONFIRMATION': return 1;
      case 'RECEIVED': return 2;
      default: return -1;
    }
  }

  downloadContractAsPDF(): void {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const raw = this.contractForm.getRawValue();
      const title = raw.title || 'Contrato de Inversión';
      const amount = raw.amount ? `${raw.amount.toLocaleString()} ${raw.currency}` : '0 USD';
      const profit1 = `${raw.profit1Year || 0}%`;
      const profit2 = `${raw.profit2Years || 0}%`;
      const profit3 = `${raw.profit3Years || 0}%`;

      // Header Banner
      pdf.setFillColor(9, 15, 29);
      pdf.rect(0, 0, 210, 32, 'F');

      pdf.setTextColor(167, 139, 250);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.text('PROY+', 15, 21);

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.text('Documento Oficial de Contrato de Inversión', 115, 21);

      // Title Section
      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(15);
      pdf.text(title, 15, 45);

      pdf.setLineWidth(0.5);
      pdf.setDrawColor(226, 232, 240);
      pdf.line(15, 49, 195, 49);

      // Financial Summary Box
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(15, 54, 180, 28, 3, 3, 'F');

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 116, 139);
      pdf.text('MONTO DE INVERSIÓN', 22, 63);
      pdf.text('RETORNO AÑO 1', 75, 63);
      pdf.text('RETORNO AÑO 2', 118, 63);
      pdf.text('RETORNO AÑO 3', 160, 63);

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(124, 58, 237);
      pdf.text(amount, 22, 74);

      pdf.setTextColor(16, 185, 129);
      pdf.text(profit1, 75, 74);
      pdf.text(profit2, 118, 74);
      pdf.text(profit3, 160, 74);

      // Clauses Heading
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('Cláusulas y Términos del Acuerdo:', 15, 94);

      // Clean HTML tags into formatted plain text
      let rawDesc = raw.description || '';
      let cleanText = rawDesc
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/<h[1-6][^>]*>/gi, '\n\n')
        .replace(/<\/h[1-6]>/gi, '\n')
        .replace(/<p[^>]*>/gi, '\n')
        .replace(/<\/p>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<li[^>]*>/gi, '\n • ')
        .replace(/<\/li>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();

      if (!cleanText) {
        cleanText = 'No se han especificado cláusulas adicionales en este documento de contrato.';
      }

      const splitText = pdf.splitTextToSize(cleanText, 180);
      let yPosition = 102;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(51, 65, 85);

      for (let i = 0; i < splitText.length; i++) {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(splitText[i], 15, yPosition);
        yPosition += 5.5;
      }

      // Signatures
      if (yPosition > 240) {
        pdf.addPage();
        yPosition = 40;
      } else {
        yPosition += 20;
      }

      pdf.setDrawColor(148, 163, 184);
      pdf.line(20, yPosition + 15, 85, yPosition + 15);
      pdf.line(125, yPosition + 15, 190, yPosition + 15);

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 116, 139);
      pdf.text('Firma del Inversor', 38, yPosition + 21);
      pdf.text('Firma del Emprendedor', 137, yPosition + 21);

      const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `Contrato_${sanitizedTitle}.pdf`;

      pdf.save(fileName);
      this.toast.add({ severity: 'success', summary: 'PDF Descargado', detail: `Se ha descargado el contrato "${fileName}"` });
    } catch (err) {
      console.error('Error generating PDF:', err);
      this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el documento PDF.' });
    }
  }

  private updateContractInList(updated: IContract): void {
    this.contracts.update(list =>
      list.map(c => c.idContract === updated.idContract ? updated : c)
    );
  }

  getContractStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'DRAFT': 'Borrador (En Negociación)',
      'PARTIALLY_SIGNED': 'Aprobado (Pend. Firma)',
      'SIGNED': 'Firmado',
      'CANCELLED': 'Cancelado',
      'REFUNDED': 'Devuelto',
      'CLOSED': 'Cerrado',
      'PENDING_STUDENT_SIGNATURE': 'Pendiente de Firma'
    };
    return map[status] || status;
  }

  getInvestmentStatusLabel(status: IInvestment['status'] | null): string {
    const isInvestor = this.isInvestor();

    switch (status) {
      case 'IN_PROGRESS':
        return isInvestor ? 'Pendiente de Envío' : 'Pendiente de Recepción';
      case 'PENDING_CONFIRMATION':
        return isInvestor ? 'Envío Notificado (Esperando Confirmación)' : 'Confirmación Pendiente';
      case 'RECEIVED':
        return isInvestor ? 'Inversión Recibida por el Estudiante' : 'Fondos Recibidos';
      case 'NOT_RECEIVED':
        return isInvestor ? 'Rechazado por el Estudiante' : 'Marcado como No Recibido';
      case 'CANCELLED':
        return 'Inversión Cancelada';
      case 'PENDING_RETURN':
        return 'Pendiente de Devolución';
      case 'COMPLETED':
        return 'Inversión Completada';
      default:
        return 'Desconocido';
    }
  }

  getEarningStatusLabel(status: IEarning['status'] | null): string {
    const isInvestor = this.isInvestor();
    switch (status) {
      case 'IN_PROGRESS':
        return isInvestor ? 'Pendiente de Envío por el Estudiante' : 'Pendiente de Envío al Inversor';
      case 'PENDING_CONFIRMATION':
        return isInvestor ? 'Confirmación de Recepción Pendiente' : 'Envío Notificado';
      case 'RECEIVED':
        return 'Ganancia Recibida';
      case 'NOT_RECEIVED':
        return 'Marcado como No Recibido';
      default:
        return 'Desconocido';
    }
  }

  tagStyle(status: string) {
    switch (status) {
      case 'DRAFT': 
        return { 'background-color': 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)', 'border-radius': '9999px', 'font-weight': '700', 'padding': '0.2rem 0.75rem' };
      case 'PARTIALLY_SIGNED':
      case 'PENDING_STUDENT_SIGNATURE': 
        return { 'background-color': 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)', 'border-radius': '9999px', 'font-weight': '700', 'padding': '0.2rem 0.75rem' };
      case 'SIGNED': 
        return { 'background-color': 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)', 'border-radius': '9999px', 'font-weight': '700', 'padding': '0.2rem 0.75rem' };
      case 'CLOSED': 
        return { 'background-color': 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.4)', 'border-radius': '9999px', 'font-weight': '700', 'padding': '0.2rem 0.75rem' };
      case 'CANCELLED':
      case 'REFUNDED': 
        return { 'background-color': 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', 'border-radius': '9999px', 'font-weight': '700', 'padding': '0.2rem 0.75rem' };
      default: 
        return { 'background-color': 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', border: '1px solid rgba(107, 114, 128, 0.4)', 'border-radius': '9999px', 'font-weight': '700', 'padding': '0.2rem 0.75rem' };
    }
  }
}
