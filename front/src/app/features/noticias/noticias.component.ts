import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Noticia {
  text: string;
  speed: string;
}

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './noticias.component.html',
  styleUrls: ['./noticias.component.scss']
})
export class NoticiasComponent implements OnInit {
  noticias: Noticia[] = [
    { text: 'El dólar sube y afecta mercados globales', speed: '18s' },
    { text: 'Nueva ley financiera impulsa inversiones', speed: '20s' },
    { text: 'Bancos anuncian reducción de tasas', speed: '22s' },
    { text: 'Criptomonedas alcanzan récord histórico', speed: '19s' },
    { text: 'El FMI prevé crecimiento económico', speed: '21s' }
  ];

  ngOnInit(): void {}
}
