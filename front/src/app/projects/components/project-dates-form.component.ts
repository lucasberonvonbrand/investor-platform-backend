import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-project-dates-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, TooltipModule],
  template: `
    <div [formGroup]="parentForm()" class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      <div class="md:col-span-2 pb-2 border-b border-[#1e293b] mt-4 flex items-center gap-2">
        <i class="pi pi-calendar text-[#a78bfa]"></i>
        <h3 class="text-base font-extrabold text-white">Fechas y Plazos</h3>
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="startDate" class="font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>Fecha de Inicio / Cierre de Financiación *</span>
          <i class="pi pi-info-circle cursor-pointer text-slate-400" pTooltip="La fecha en la que planeas comenzar a trabajar activamente en el proyecto."></i>
        </label>
        <input id="startDate" type="date" formControlName="startDate" 
               class="w-full p-3 border border-[#1e293b] bg-[#121c33] text-white rounded-xl focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-all" />
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="estimatedEndDate" class="font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>Fecha Estimada de Finalización *</span>
          <i class="pi pi-info-circle cursor-pointer text-slate-400" pTooltip="Una fecha aproximada de cuándo esperas completar los objetivos principales."></i>
        </label>
        <input id="estimatedEndDate" type="date" formControlName="estimatedEndDate" 
               class="w-full p-3 border border-[#1e293b] bg-[#121c33] text-white rounded-xl focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-all" />
        <small class="text-red-400 text-xs" *ngIf="parentForm().get('estimatedEndDate')?.errors?.['server']">
          {{ parentForm().get('estimatedEndDate')?.errors?.['server'] }}
        </small>
      </div>
    </div>
  `
})
export class ProjectDatesFormComponent {
  parentForm = input.required<FormGroup>();
}
