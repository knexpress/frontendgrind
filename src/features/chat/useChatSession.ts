import { useCallback, useEffect, useState } from "react";
import {
  createConversation,
  fetchConversation,
  sendMessage,
  type ConversationMessage,
} from "../../api/conversations";
import { ApiError } from "../../api/http";

const SESSION_KEY = "grind_conversation_id";

type Status = "idle" | "loading" | "sending" | "error";

export function useChatSession() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const bootstrap = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
      const { id } = await createConversation();
      sessionStorage.setItem(SESSION_KEY, id);
      setConversationId(id);
      const conv = await fetchConversation(id);
      setMessages(conv.messages);
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof ApiError ? e.message : "Could not start session");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setStatus("loading");
      setError(null);
      const stored = sessionStorage.getItem(SESSION_KEY);
      try {
        if (stored) {
          const conv = await fetchConversation(stored);
          if (cancelled) return;
          setConversationId(conv.id);
          setMessages(conv.messages);
          setStatus("idle");
          return;
        }
        const { id } = await createConversation();
        if (cancelled) return;
        sessionStorage.setItem(SESSION_KEY, id);
        setConversationId(id);
        const conv = await fetchConversation(id);
        if (cancelled) return;
        setMessages(conv.messages);
        setStatus("idle");
      } catch {
        if (cancelled) return;
        sessionStorage.removeItem(SESSION_KEY);
        try {
          const { id } = await createConversation();
          if (cancelled) return;
          sessionStorage.setItem(SESSION_KEY, id);
          setConversationId(id);
          const conv = await fetchConversation(id);
          if (cancelled) return;
          setMessages(conv.messages);
          setStatus("idle");
        } catch (e) {
          if (cancelled) return;
          setStatus("error");
          setError(e instanceof ApiError ? e.message : "Could not start session");
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const send = useCallback(
    async (text: string) => {
      if (!conversationId) return;
      const trimmed = text.trim();
      if (!trimmed) return;

      setError(null);
      const userMsg: ConversationMessage = { role: "user", content: trimmed };
      setMessages((m) => [...m, userMsg]);
      setStatus("sending");

      try {
        const reply = await sendMessage(conversationId, trimmed);
        setMessages((m) => [...m, { role: "assistant", content: reply.content }]);
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
    messages,
    status,
    error,
    send,
    retry: bootstrap,
  };
}
