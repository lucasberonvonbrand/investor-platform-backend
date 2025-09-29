import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';


@Component({
  selector: 'app-investors-update',
  templateUrl: './investors-update-form.component.html',
  styleUrls: ['./investors-update-form.component.scss'], 
  imports: [ReactiveFormsModule],
})
export class InvestorsUpdateComponent implements OnInit {
  // Propiedad para el formulario reactivo, inicializada en ngOnInit ...
  investorsUpdateForm!: FormGroup;
  
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
    this.investorsUpdateForm = this.fb.group({
      nombre: [this.usuario.nombre, Validators.required],
      //apellido: [this.usuario.apellido, Validators.required],
      dni: [this.usuario.dni, Validators.required],
      fechaNacimiento: [this.usuario.fechaNacimiento, Validators.required],
      facebook: [this.usuario.facebook],
    });
  }

  guardar() {
    if (this.investorsUpdateForm.valid) {
      console.log('Datos guardados:', this.investorsUpdateForm.value);
      alert('Perfil actualizado con éxito ✅');
    } else {
      alert('Por favor, completa los campos requeridos ❌');
    }
  }

  cancelar() {
    if (this.investorsUpdateForm.valid) {
      console.log('Datos guardados:', this.investorsUpdateForm.value);
      alert('Perfil actualizado con éxito ✅');
    } 
  }

/*
  onFileSelect(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = {
        file: file,
        url: URL.createObjectURL(file)
      };
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.selectedFile = {
        file: file,
        url: URL.createObjectURL(file)
      };
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }
*/
/*
  onSubmit() {
    if (this.projectForm.valid) {
      const formData = new FormData();
      formData.append('title', this.projectForm.value.title);
      formData.append('description', this.projectForm.value.description);
      formData.append('status', this.projectForm.value.status);
      formData.append('objective', this.projectForm.value.objective);
      formData.append('startDate', this.projectForm.value.startDate);
      formData.append('endDate', this.projectForm.value.endDate);
      formData.append('creator', this.projectForm.value.creator);
      if (this.selectedFile) {
        formData.append('file', this.selectedFile.file, this.selectedFile.file.name);
      }

      this.isLoading = true; 
      this.progress = 0; 

      const interval = setInterval(() => {
        this.progress += 10;
        if (this.progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            this.isLoading = false; 
            this.projectForm.reset(); 
          }, 500);
        }
      }, 300); 
    }
  }
*/




}


      /////////////////////////////////////////////////////////////////////////////////////////
      /** Método para manejar el envío del formulario
      onSubmit() {
      Verifica si el formulario es válido (todos los campos requeridos están llenos)
      if (this.projectForm.valid) {
      const formData = new FormData();
      
      Agrega cada campo del formulario al objeto FormData
      formData.append('title', this.projectForm.value.title);
      formData.append('description', this.projectForm.value.description);
      formData.append('status', this.projectForm.value.status);
      formData.append('objective', this.projectForm.value.objective);
      formData.append('startDate', this.projectForm.value.startDate);
      formData.append('endDate', this.projectForm.value.endDate);
      formData.append('creator', this.projectForm.value.creator);

      Si hay un archivo seleccionado, lo agrega a FormData
      if (this.selectedFile) {
        formData.append('file', this.selectedFile.file, this.selectedFile.file.name);
      }
      
      Muestra los datos que se enviarían (para depuración)
      console.log('Form data to be sent:', formData);
      
      Aquí puedes agregar la lógica para enviar formData a tu API
      Por ejemplo, usando un servicio de HttpClient:
       this.miServicio.crearProyecto(formData).subscribe(respuesta => { ... }); 
       */