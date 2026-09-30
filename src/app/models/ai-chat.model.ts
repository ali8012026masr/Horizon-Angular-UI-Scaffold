export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type AiActionType = 'FILTER_SLOTS' | 'RECOMMEND_BUNDLE' | 'RECOMMEND_GROUP_BUNDLE' | 'NONE';

export interface AiChatResponse {
  replyText: string;
  actionType: AiActionType;
  actionPayloadJson?: string;
}

export interface AiChatRequest {
  userMessage: string;
  history: ChatMessage[];
}
