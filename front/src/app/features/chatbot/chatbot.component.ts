import { Component } from '@angular/core';
import { Router } from '@angular/router';
    import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
})
export class ChatbotComponent {
  isChatOpen = false;
  shouldShowChatbot = true;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.shouldShowChatbot = !this.router.url.includes('/auth/login');
    });
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }
}
