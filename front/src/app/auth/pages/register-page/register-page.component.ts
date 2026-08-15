import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";

@Component({
  standalone: true,
  selector: 'app-register-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent {
}
