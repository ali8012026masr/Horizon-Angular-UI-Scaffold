import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AiChatService } from '../../../../core/services/ai-chat';

@Component({
  selector: 'app-ai-concierge',
  templateUrl: './ai-concierge.html',
  styleUrl: './ai-concierge.scss',
})
export class AiConcierge {
  readonly chatService = inject(AiChatService);
  private readonly router = inject(Router);

  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  readonly isOpen = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  toggleOpen(): void {
    this.isOpen.update((v) => !v);
    if (this.isOpen()) {
      this.scrollToBottom();
    }
  }

  onSend(message: string): void {
    if (!message || !message.trim()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.scrollToBottom();

    this.chatService.sendMessage(message).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.scrollToBottom();

        // actionPayloadJson has already been slot/guide-id-validated server-side
        // (AiChatController#validateAgainstCatalog) - still guard JSON.parse here
        // since it is untrusted string content over the wire.
        try {
          switch (res.actionType) {
            case 'FILTER_SLOTS': {
              if (!res.actionPayloadJson) break;
              const filterParams = JSON.parse(res.actionPayloadJson);
              this.router.navigate(['/tourist/slots'], { queryParams: filterParams });
              break;
            }
            case 'RECOMMEND_BUNDLE':
            case 'RECOMMEND_GROUP_BUNDLE': {
              if (!res.actionPayloadJson) break;
              const bundle = JSON.parse(res.actionPayloadJson);
              this.router.navigate(['/tourist/slots'], {
                queryParams: { slotId: bundle.slotId, guideId: bundle.guideId, bundle: res.actionType },
              });
              break;
            }
            case 'NONE':
            default:
              break;
          }
        } catch (e) {
          console.error('Failed to parse AI action payload', e);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('The concierge is momentarily resting. Please try again.');
      },
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      } catch {
        // container not yet rendered (drawer closed) - nothing to scroll
      }
    }, 100);
  }
}
