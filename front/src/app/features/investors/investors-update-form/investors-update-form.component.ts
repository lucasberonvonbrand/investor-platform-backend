import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { InvestorService } from '../../../core/services/investors.service';
import { AuthService } from '../../auth/login/auth.service';
import { Investor, Province } from '../../../models/investor.model';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-investors-update',
  templateUrl: './investors-update-form.component.html',
  styleUrls: ['./investors-update-form.component.scss'], 
  standalone: true,
  imports: [
    ReactiveFormsModule, CommonModule, ToastModule,
    CardModule,
    ButtonModule,
    InputTextModule
  ],
  providers: [MessageService]
})
export class InvestorsUpdateComponent implements OnInit {
  investorsUpdateForm!: FormGroup;
  investor!: Investor;
  isLoading = false;

  provinces = Object.values(Province);

  constructor(
    private fb: FormBuilder,
    private investorService: InvestorService,
    private auth: AuthService,
    private router: Router,
    private toast: MessageService
  ) {}

ngOnInit(): void {
    this.buildForm({} as Investor);

    const userId = this.auth.userId;
    const role = this.auth.getUserRole();

    if (role === 'ROLE_INVESTOR' && userId) {
      this.isLoading = true;
      this.investorService.getById(userId).subscribe({
        next: (investor) => {
          this.investor = investor;
          this.buildForm(investor); // Re-construir el form con los datos
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error cargando inversor:', err);
          this.isLoading = false;
          this.router.navigateByUrl('/dashboard');
        }
      });
    } else {
      this.router.navigateByUrl('/dashboard');
    }
  }

  private buildForm(investor: Investor): void {
    this.investorsUpdateForm = this.fb.group({
      username: [investor.username ?? '', [Validators.required, Validators.maxLength(15), Validators.pattern('^[A-Za-z0-9 ./,!&]+$')]],
      email: [investor.email ?? '', [Validators.required, Validators.email, Validators.maxLength(30)]],

      photoUrl: [investor.photoUrl ?? '', [Validators.maxLength(50),Validators.pattern('https?://.+')]],
      cuit: [investor.cuit ?? '', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.minLength(11), Validators.maxLength(11)]],
      contactPerson: [investor.contactPerson ?? '', [Validators.required, Validators.maxLength(15), Validators.pattern('^[A-Za-zÀ-ÿ ]+$')]],
      phone: [investor.phone ?? '', [Validators.required, Validators.maxLength(13), Validators.pattern('^[0-9]+$')]],
      webSite: [investor.webSite ?? '', [Validators.maxLength(50),Validators.pattern('https?://.+')]],
      address: this.fb.group({
        street: [investor.address?.street ?? '', [Validators.required, Validators.maxLength(50), Validators.pattern('^[A-Za-zÀ-ÿ ]+$')]],
        number: [investor.address?.number ?? '', [Validators.required, Validators.maxLength(5), Validators.pattern('^[0-9]+$')]],
        city: [investor.address?.city ?? '', [Validators.required,Validators.maxLength(50), Validators.pattern('^[A-Za-zÀ-ÿ ]+$')]],
        province: [investor.address?.province ?? '', [Validators.required,Validators.maxLength(30), Validators.pattern('^[A-Za-zÀ-ÿ ]+$')]],
        postalCode: [investor.address?.postalCode ?? null, [Validators.required,Validators.maxLength(5), Validators.pattern('^[0-9]+$')]]
      })
    });
  }

  guardar() {
    if (this.investorsUpdateForm.valid) {
      this.isLoading = true;
      if (!this.investor?.id) {
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo identificar al inversor para actualizar.' });
        this.isLoading = false;
        return;
      }
      this.investorService.update(this.investor.id, this.investorsUpdateForm.value).subscribe({
        next: (updated) => {
          console.log('Perfil de inversor actualizado:', updated);
          this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Perfil actualizado correctamente.' });
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error actualizando perfil:', err);
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el perfil.' });
          this.isLoading = false;
        }
      });
    } else {
      this.investorsUpdateForm.markAllAsTouched();
      this.investorsUpdateForm.updateValueAndValidity();
      this.toast.add({ severity: 'warn', summary: 'Atención', detail: 'Por favor, completa todos los campos requeridos.' });
      return;
    }
  }

  cancelar() {
    this.router.navigateByUrl('/proyectos-panel');
  }
}
