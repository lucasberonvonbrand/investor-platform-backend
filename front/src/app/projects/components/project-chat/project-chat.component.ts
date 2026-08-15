import { Component, input, effect, signal, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ProjectDetailsService, IChatMessage } from '../../services/project-details.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-project-chat',
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, ToastModule],
  templateUrl: './project-chat.component.html',
  providers: [MessageService]
})
export class ProjectChatComponent {
  projectId = input<number | undefined>();
  
  private svc = inject(ProjectDetailsService);
  private auth = inject(AuthService);
  private toast = inject(MessageService);

  messages = signal<IChatMessage[]>([]);
  newMessage = signal('');
  isSending = signal(false);

  currentUser = this.auth.getSession();

  @ViewChild('chatScroll') chatScroll!: ElementRef;

  constructor() {
    effect(() => {
      const pid = this.projectId();
      if (pid) {
        this.loadChat(pid);
      }
    });
  }

  loadChat(pid: number): void {
    this.svc.getChat(pid).subscribe({
      next: (msgs) => {
        this.messages.set(msgs);
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  sendMessage(): void {
    const text = this.newMessage().trim();
    const pid = this.projectId();
    if (!text || !pid || !this.currentUser) return;

    this.isSending.set(true);
    const msg: Omit<IChatMessage, 'id' | 'createdAt'> = {
      projectId: pid,
      authorId: this.currentUser.id,
      authorName: this.currentUser.username,
      message: text
    };

    this.svc.sendMessage(msg).subscribe({
      next: (m) => {
        this.messages.update(msgs => [...msgs, m]);
        this.newMessage.set('');
        this.isSending.set(false);
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: () => {
        this.isSending.set(false);
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Could not send message' });
      }
    });
  }

  scrollToBottom(): void {
    try {
      this.chatScroll.nativeElement.scrollTop = this.chatScroll.nativeElement.scrollHeight;
    } catch(err) { }
  }

  isMe(authorId: number): boolean {
    return this.currentUser?.id === authorId;
  }
}
