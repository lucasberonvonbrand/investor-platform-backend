import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ChatResponse { text: string; markdown?: string; validations?: any[]; }

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<string> {
    return this.http
      .post('/api/chatbot', message, { responseType: 'text' as 'json' })
      .pipe(map(res => String(res)));
  }
}