import { useCallback, useEffect, useState } from "react";
import {
  createConversation,
  fetchConversation,
  listConversations,
  sendMessage,
  type ConversationListItem,
  type ModelAlias,
  type ConversationMessage,
} from "../../api/conversations";
import { ApiError } from "../../api/http";

type Status = "idle" | "loading" | "sending" | "error";

function sessionKeyForUser(userId: string): string {
  return `grind_conversation_id_${userId}`;
}

export function useChatSession(userId: string) {
  const SESSION_KEY = sessionKeyForUser(userId);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [threads, setThreads] = useState<ConversationListItem[]>([]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const bootstrap = useCallback(async (targetId?: string) => {
    setStatus("loading");
    setError(null);
    try {
      const list = await listConversations();
      setThreads(list.items);

      const stored = sessionStorage.getItem(SESSION_KEY);
      const latest = list.items[0];
      let idToOpen = targetId || null;

      if (!idToOpen && stored && list.items.some((x) => x.id === stored)) {
        idToOpen = stored;
      }
      if (!idToOpen && latest) {
        const ageMs = Date.now() - new Date(latest.updatedAt).getTime();
        const shouldAutoNew = ageMs > 24 * 60 * 60 * 1000;
        if (!shouldAutoNew) {
          idToOpen = latest.id;
        }
      }
      if (!idToOpen) {
        const created = await createConversation();
        idToOpen = created.id;
      }

      sessionStorage.setItem(SESSION_KEY, idToOpen);
      setConversationId(idToOpen);
      const conv = await fetchConversation(idToOpen);
      setMessages(conv.messages);
      if (!list.items.some((x) => x.id === idToOpen)) {
        const updated = await listConversations();
        setThreads(updated.items);
      }
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof ApiError ? e.message : "Could not start session");
    }
  }, [SESSION_KEY]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await bootstrap();
      } catch {
        if (cancelled) return;
        sessionStorage.removeItem(SESSION_KEY);
        setStatus("error");
        setError("Could not start session");
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [SESSION_KEY, bootstrap]);

  const send = useCallback(
    async (text: string, model?: ModelAlias) => {
      if (!conversationId) return;
      const trimmed = text.trim();
      if (!trimmed) return;

      setError(null);
      const userMsg: ConversationMessage = { role: "user", content: trimmed };
      setMessages((m) => [...m, userMsg]);
      setStatus("sending");

      try {
        const reply = await sendMessage(conversationId, trimmed, model);
        setMessages((m) => [...m, { role: "assistant", content: reply.content }]);
        const latestList = await listConversations();
        setThreads(latestList.items);
        setStatus("idle");
      } catch (e) {
        setMessages((m) => m.slice(0, -1));
        setStatus("idle");
        setError(e instanceof ApiError ? e.message : "Message failed");
      }
    },
    [conversationId]
  );

  return {
    conversationId,
    threads,
    messages,
    status,
    error,
    send,
    openConversation: bootstrap,
    createNewConversation: async () => {
      const created = await createConversation();
      await bootstrap(created.id);
    },
    retry: bootstrap,
  };
}
