import { createMiniApiClient } from '../../services/mini-api.js';

export type XuxuApiMessage = { role: 'user' | 'assistant'; content: string };

export type XuxuReply = {
  message: { role: 'assistant'; content: string };
  model: string;
};

export function chatWithXuxu(messages: XuxuApiMessage[]) {
  return createMiniApiClient().post<XuxuReply>('/xuxu/chat', { messages });
}
