export type AppRole = 'tourist' | 'provider' | 'guide' | 'admin';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  verified: boolean;
}
