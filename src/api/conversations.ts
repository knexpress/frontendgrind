import { apiJson } from "./http";

export type ChatRole = "user" | "assistant" | "system";

export type ConversationMessage = {
  role: ChatRole;
  content: string;
  createdAt?: string;
};

export type ConversationDto = {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
};

export async function createConversation(): Promise<{ id: string; createdAt: string }> {
  return apiJson("/conversations", { method: "POST" });
}

export async function fetchConversation(id: string): Promise<ConversationDto> {
  return apiJson(`/conversations/${id}`, { method: "GET" });
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<{ role: "assistant"; content: string; model: string }> {
  return apiJson(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}
