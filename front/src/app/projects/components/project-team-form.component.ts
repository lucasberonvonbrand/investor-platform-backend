import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { AutoCompleteModule } from 'primeng/autocomplete';
export interface StudentName {
  id: number;
  firstName: string;
  lastName: string;
}

type StudentWithFullName = StudentName & { fullName: string };

@Component({
  selector: 'app-project-team-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, TooltipModule, AutoCompleteModule],
  template: `
    <div [formGroup]="parentForm()" class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      <div class="md:col-span-2 pb-2 border-b border-[#1e293b] mt-4 flex items-center gap-2">
        <i class="pi pi-users text-[#a78bfa]"></i>
        <h3 class="text-base font-extrabold text-white">Equipo del Proyecto</h3>
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="owner" class="font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>Líder del Proyecto</span>
          <i class="pi pi-info-circle cursor-pointer text-slate-400" pTooltip="Eres el propietario y punto de contacto principal. Este campo se asigna automáticamente."></i>
        </label>
        <input id="owner" type="text" [value]="parentForm().get('owner')?.value?.fullName || ''" 
               class="w-full p-3 border border-[#1e293b] bg-[#121c33]/50 text-slate-300 rounded-xl cursor-not-allowed" [disabled]="true" />
        <small class="text-slate-400 text-xs mt-0.5 block">El líder del proyecto es la cuenta que ha iniciado sesión.</small>
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="students" class="font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>Integrantes Adicionales del Equipo</span>
          <i class="pi pi-info-circle cursor-pointer text-slate-400" pTooltip="Busca y agrega a otros estudiantes que formarán parte del equipo."></i>
        </label>
        <p-autoComplete
          inputId="students"
          formControlName="students"
          [multiple]="true"
          [dropdown]="true"
          [suggestions]="suggestionsStudents()"
          (completeMethod)="completeStudents.emit($event)"
          (onDropdownClick)="showAllStudents.emit()"
          [minLength]="0"
          [delay]="200"
          [forceSelection]="true"
          appendTo="body"
          dataKey="id"
          optionLabel="fullName"
          styleClass="w-full dark-autocomplete-container"
          panelStyleClass="dark-autocomplete-panel"
          inputStyleClass="w-full p-3 border border-[#1e293b] bg-[#121c33] text-white rounded-xl focus:outline-none">
          <ng-template pTemplate="item" let-item>
            <span class="font-bold text-sm text-slate-100">{{ item.fullName }}</span>
          </ng-template>
        </p-autoComplete>
        <small class="text-slate-400 text-xs mt-0.5 block">Puedes buscar e incluir varios compañeros por su nombre.</small>
      </div>
    </div>
  `
})
export class ProjectTeamFormComponent {
  parentForm = input.required<FormGroup>();
  suggestionsStudents = input.required<StudentWithFullName[]>();

  completeStudents = output<{ query: string }>();
  showAllStudents = output<void>();
}
