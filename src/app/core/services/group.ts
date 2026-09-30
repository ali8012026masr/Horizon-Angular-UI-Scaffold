import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AttachGroupBookingRequest,
  CreateGroupRequest,
  GroupMemberResponse,
  GroupResponse,
  JoinGroupRequest,
} from '../../models/group.model';

@Injectable({ providedIn: 'root' })
export class GroupService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/groups`;

  getById(groupId: string): Observable<GroupResponse> {
    return this.http.get<GroupResponse>(`${this.baseUrl}/${groupId}`);
  }

  listByTourist(touristId: string): Observable<GroupResponse[]> {
    return this.http.get<GroupResponse[]>(`${this.baseUrl}/tourist/${touristId}`);
  }

  create(request: CreateGroupRequest): Observable<GroupResponse> {
    return this.http.post<GroupResponse>(this.baseUrl, request);
  }

  joinByCode(request: JoinGroupRequest): Observable<GroupResponse> {
    return this.http.post<GroupResponse>(`${this.baseUrl}/join`, request);
  }

  listMembers(groupId: string): Observable<GroupMemberResponse[]> {
    return this.http.get<GroupMemberResponse[]>(`${this.baseUrl}/${groupId}/members`);
  }

  removeMember(groupId: string, touristId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${groupId}/members/${touristId}`);
  }

  attachBooking(groupId: string, request: AttachGroupBookingRequest): Observable<GroupResponse> {
    return this.http.post<GroupResponse>(`${this.baseUrl}/${groupId}/booking`, request);
  }

  markPaid(groupId: string, touristId: string): Observable<GroupMemberResponse> {
    return this.http.put<GroupMemberResponse>(`${this.baseUrl}/${groupId}/members/${touristId}/paid`, {});
  }
}
