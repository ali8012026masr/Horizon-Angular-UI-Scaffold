import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GroupMessageResponse, SendGroupMessageRequest } from '../../models/group-message.model';

@Injectable({ providedIn: 'root' })
export class GroupMessageService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/groups`;

  listByGroup(groupId: string): Observable<GroupMessageResponse[]> {
    return this.http.get<GroupMessageResponse[]>(`${this.baseUrl}/${groupId}/messages`);
  }

  send(groupId: string, request: SendGroupMessageRequest): Observable<GroupMessageResponse> {
    return this.http.post<GroupMessageResponse>(`${this.baseUrl}/${groupId}/messages`, request);
  }
}
