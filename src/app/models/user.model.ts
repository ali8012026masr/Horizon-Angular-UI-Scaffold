export type UserStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'REVOKED';

export interface AdminUserResponse {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: UserStatus;
  createdAt: string;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
}
