import { Component } from '@angular/core';

@Component({
  selector: 'app-contratos', // Asegúrate de que este selector coincida con cómo lo usas en tu router o plantilla
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss']
})
export class ContratosComponent {
  // Aquí no necesitamos declarar ninguna variable ni método,
  // ya que la información es estática y está toda en el HTML.
  
  constructor() { }

  // Si quisieras, podrías definir el título aquí:
  // pageTitle: string = 'Contratos y Licencias';
  
  // Pero para un texto legal/informativo simple,
  // ¡este archivo puede estar prácticamente vacío!
}