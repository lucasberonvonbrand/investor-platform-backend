import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {FormControl, ReactiveFormsModule} from '@angular/forms';


@Component({
  selector: 'app-create-project',
  templateUrl: './proyectos.component.html',
  styleUrls: ['./proyectos.component.scss'], 
  imports: [ReactiveFormsModule],
})
export class ProyectosComponent {
  projectForm: FormGroup;
  selectedFile: { file: File, url: string } | null = null;

  constructor(private fb: FormBuilder) {
    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      description: ['']
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
    }
  }
}