import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para NgClass

@Component({
  selector: 'app-marquesina',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marquesina.component.html',
  styleUrls: ['./marquesina.component.scss']
})
export class MarquesinaComponent {
  @Input() text: string = 'Texto de Marquesina';
  @Input() speed: string = '20s'; // Velocidad de animación
  
  isPaused: boolean = false;

  // Pausar la animación al pasar el ratón
  @HostListener('mouseenter') onMouseEnter() {
    this.isPaused = true;
  }

  // Reanudar la animación al quitar el ratón
  @HostListener('mouseleave') onMouseLeave() {
    this.isPaused = false;
  }
}