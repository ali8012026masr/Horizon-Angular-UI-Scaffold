export interface GroupMessageResponse {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  sentAt: string;
}

export interface SendGroupMessageRequest {
  touristId: string;
  message: string;
}
