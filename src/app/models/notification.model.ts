/** Raw shape returned by the backend (NotificationResponse.java). */
export interface NotificationResponse {
  id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}
