import { apiJson } from "./http";

export type ChatRole = "user" | "assistant" | "system";
export type ModelAlias = "Chat" | "Thinking" | "Thinking2.0" | "Flash-Lite" | "Flash-Omni" | "Flash-Chat";
export type ResponseStyle = "auto" | "short" | "bullet" | "detailed";

export type SourceReference = {
  title: string;
  url: string;
  snippet: string;
  provider: string;
};

export type ConversationMessage = {
  role: ChatRole;
  content: string;
  sources?: SourceReference[];
  createdAt?: string;
  localImagePreviewUrl?: string;
  localImageName?: string;
};

export type ConversationDto = {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
};

export type ConversationListItem = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessagePreview: string;
};

export type ModelOption = {
  alias: ModelAlias;
  description: string;
};

export async function createConversation(): Promise<{ id: string; createdAt: string }> {
  return apiJson("/conversations", { method: "POST" });
}

export async function fetchConversation(id: string): Promise<ConversationDto> {
  return apiJson(`/conversations/${id}`, { method: "GET" });
}

export async function listConversations(): Promise<{ items: ConversationListItem[] }> {
  return apiJson("/conversations", { method: "GET" });
}

export async function fetchModelOptions(): Promise<{ items: ModelOption[] }> {
  return apiJson("/ai/models", { method: "GET" });
}

export async function sendMessage(
  conversationId: string,
  content: string,
  model?: ModelAlias,
  responseStyle?: ResponseStyle,
  imageFile?: File | null
): Promise<{ role: "assistant"; content: string; model: string; sources?: SourceReference[] }> {
  if (imageFile) {
    const form = new FormData();
    form.append("content", content);
    if (model) form.append("model", model);
    if (responseStyle) form.append("responseStyle", responseStyle);
    form.append("image", imageFile);
    return apiJson(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: form,
    });
  }
  return apiJson(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content, model, responseStyle }),
  });
}

export async function editMessage(
  conversationId: string,
  messageIndex: number,
  content: string,
  model?: ModelAlias,
  responseStyle?: ResponseStyle
): Promise<{ role: "assistant"; content: string; model: string; sources?: SourceReference[] }> {
  return apiJson(`/conversations/${conversationId}/messages/${messageIndex}`, {
    method: "PATCH",
    body: JSON.stringify({ content, model, responseStyle }),
  });
}
