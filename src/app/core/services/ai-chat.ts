import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AiChatResponse, ChatMessage } from '../../models/ai-chat.model';

const MAX_STORED_TURNS = 40;

@Injectable({ providedIn: 'root' })
export class AiChatService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/ai/chat`;

  readonly history = signal<ChatMessage[]>([]);

  sendMessage(userMessage: string): Observable<AiChatResponse> {
    const payload = {
      userMessage,
      history: this.history(),
    };

    return this.http.post<AiChatResponse>(this.baseUrl, payload).pipe(
      tap((res) => {
        this.history.update((prev) => {
          const next = [...prev, { role: 'user' as const, text: userMessage }, { role: 'model' as const, text: res.replyText }];
          return next.length > MAX_STORED_TURNS ? next.slice(next.length - MAX_STORED_TURNS) : next;
        });
      })
    );
  }

  clearHistory(): void {
    this.history.set([]);
  }
}
