import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  RegisterGuideRequest,
  RegisterProviderRequest,
  RegisterTouristRequest,
  ResetPasswordRequest,
} from '../../models/auth.model';
import { AppRole, UserSession } from '../../models/user-session.model';

const SESSION_KEY = 'horizon-session';
const TOKENS_KEY = 'horizon-tokens';

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

const BACKEND_ROLE_TO_APP_ROLE: Record<string, AppRole> = {
  TOURIST: 'tourist',
  SERVICE_PROVIDER: 'provider',
  TOUR_GUIDE: 'guide',
  SYSTEM_ADMIN: 'admin',
};

function toAppRole(backendRole: string): AppRole {
  return BACKEND_ROLE_TO_APP_ROLE[backendRole] ?? (backendRole.toLowerCase() as AppRole);
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private readonly defaultSession: UserSession = {
    id: 'u-1001',
    name: 'Mohammad Ali',
    email: 'tourist@horizon.app',
    role: 'tourist',
    verified: true,
  };

  private readonly sessionState = signal<UserSession>(this.readStoredSession());
  readonly currentUser = computed(() => this.sessionState());
  readonly currentRole = computed(() => this.sessionState().role);

  login(request: LoginRequest): Observable<UserSession> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request).pipe(
      tap((response) =>
        this.setTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken })
      ),
      map((response) => this.toSession(response)),
      tap((session) => this.setSession(session))
    );
  }

  setTokens(tokens: StoredTokens): void {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  }

  getAccessToken(): string | null {
    return this.readTokens()?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return this.readTokens()?.refreshToken ?? null;
  }

  updateAccessToken(accessToken: string): void {
    const tokens = this.readTokens();
    if (tokens) {
      this.setTokens({ ...tokens, accessToken });
    }
  }

  clearTokens(): void {
    localStorage.removeItem(TOKENS_KEY);
  }

  private readTokens(): StoredTokens | null {
    const raw = localStorage.getItem(TOKENS_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as StoredTokens;
    } catch {
      return null;
    }
  }

  registerTourist(request: RegisterTouristRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/register/tourist`, request);
  }

  registerProvider(request: RegisterProviderRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/register/provider`, request);
  }

  registerGuide(request: RegisterGuideRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/register/guide`, request);
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/reset-password`, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.baseUrl}/change-password`, request);
  }

  switchRole(role: AppRole): void {
    const next: UserSession = {
      ...this.sessionState(),
      role,
    };
    this.setSession(next);
  }

  setSession(session: UserSession): void {
    this.sessionState.set(session);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    this.clearTokens();
    this.sessionState.set(this.defaultSession);
  }

  private toSession(response: LoginResponse): UserSession {
    const status = response.roleDetails?.status;
    return {
      id: response.id,
      name: response.fullName,
      email: response.email,
      role: toAppRole(response.role),
      verified: status ? status === 'ACTIVE' : true,
    };
  }

  private readStoredSession(): UserSession {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return this.defaultSession;
    }

    try {
      return JSON.parse(raw) as UserSession;
    } catch {
      return this.defaultSession;
    }
  }
}
