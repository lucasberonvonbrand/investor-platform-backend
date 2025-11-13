import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';


@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss'], 
  imports: [ReactiveFormsModule],
})
export class ConfiguracionComponent implements OnInit {
  // Propiedad para el formulario reactivo, inicializada en ngOnInit ...
  configuracionForm!: FormGroup;
  
  // Propiedad para almacenar el archivo seleccionado (imagen o documento)
  selectedFile: { file: File, url: string } | null = null;

  // Propiedades para la pantalla de carga
  isLoading: boolean = false; 
  progress: number = 0; 

  // Constructor: inyección de dependencias como FormBuilder
  constructor(private fb: FormBuilder) {}

/*
  // Método del ciclo de vida de Angular: se ejecuta al iniciar el componente
  ngOnInit(): void {
    // ✅ INICIALIZACIÓN CORRECTA DEL FORMULARIO
    this.configuracionForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['', Validators.required],
      objective: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      creator: ['', Validators.required]
    });
  }
*/

usuario = {
    nombre: 'Juan Pérez',
    dni: '12345678',
    fechaNacimiento: '1995-04-10',
    facebook: 'https://facebook.com/juanperez'
  };


ngOnInit(): void {
    // Cargar los datos del usuario en el formulario
    this.configuracionForm = this.fb.group({
      nombre: [this.usuario.nombre, Validators.required],
      //apellido: [this.usuario.apellido, Validators.required],
      dni: [this.usuario.dni, Validators.required],
      fechaNacimiento: [this.usuario.fechaNacimiento, Validators.required],
      facebook: [this.usuario.facebook],
    });
  }

  guardar() {
    if (this.configuracionForm.valid) {
      alert('Perfil actualizado con éxito ✅');
    } else {
      alert('Por favor, completa los campos requeridos ❌');
    }
  }

  cancelar() {
    if (this.configuracionForm.valid) {
      alert('Perfil actualizado con éxito ✅');
    } 
  }
}


   