import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {FormControl, ReactiveFormsModule} from '@angular/forms';


@Component({
  selector: 'app-create-project',
  templateUrl: './proyectos.component.html',
  styleUrls: ['./proyectos.component.scss'], 
  imports: [ReactiveFormsModule],
})
export class ProyectosComponent implements OnInit {
  // Propiedad para el formulario reactivo, inicializada en ngOnInit
  projectForm!: FormGroup;
  
  // Propiedad para almacenar el archivo seleccionado (imagen o documento)
  selectedFile: { file: File, url: string } | null = null;

  // Constructor: inyección de dependencias como FormBuilder
  constructor(private fb: FormBuilder) {}

  // Método del ciclo de vida de Angular: se ejecuta al iniciar el componente
  ngOnInit(): void {
    // Inicialización del formulario con todos los campos y validadores requeridos
    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['', Validators.required],
      objective: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      creator: ['', Validators.required]
    });
  }

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

  onSubmit() {
    if (this.projectForm.valid) {
      const formData = new FormData();
      formData.append('title', this.projectForm.value.title);
      formData.append('description', this.projectForm.value.description);
      if (this.selectedFile) {
        formData.append('file', this.selectedFile.file, this.selectedFile.file.name);
      }
      
      console.log('Form data to be sent:', formData);
      // Aquí puedes enviar formData a tu backend usando HttpClient
      // Por ejemplo: this.http.post('your-api-endpoint', formData).subscribe(...)


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


    }
  }
}