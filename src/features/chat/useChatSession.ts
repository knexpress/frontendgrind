import { useCallback, useEffect, useState } from "react";
import {
  createConversation,
  fetchConversation,
  listConversations,
  sendMessage,
  type ConversationListItem,
  type ModelAlias,
  type ConversationMessage,
  type ResponseStyle,
  type SourceReference,
} from "../../api/conversations";
import { ApiError } from "../../api/http";

type Status = "idle" | "loading" | "sending" | "error";
export const MAX_CHAT_MESSAGE_CHARS = 4000;

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

  const revealAssistantReply = useCallback(async (fullText: string, sources: SourceReference[] = []) => {
    const chunks = fullText.match(/\S+\s*/g) ?? [fullText];
    if (chunks.length === 0) return;

    setMessages((m) => [...m, { role: "assistant", content: "", sources: [] }]);

    const total = chunks.length;
    let i = 0;
    while (i < total) {
      const step = Math.max(1, Math.min(6, Math.ceil(total / 120)));
      const part = chunks.slice(i, i + step).join("");
      i += step;
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        if (!last || last.role !== "assistant") return prev;
        const next = [...prev];
        next[next.length - 1] = { ...last, content: `${last.content}${part}` };
        return next;
      });
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 22);
      });
    }

    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (!last || last.role !== "assistant") return prev;
      const next = [...prev];
      next[next.length - 1] = { ...last, sources };
      return next;
    });
  }, []);

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
    async (text: string, model?: ModelAlias, responseStyle?: ResponseStyle) => {
      if (!conversationId) return;
      const trimmed = text.trim();
      if (!trimmed) return;
      if (trimmed.length > MAX_CHAT_MESSAGE_CHARS) {
        setError(`Message is too long. Keep it under ${MAX_CHAT_MESSAGE_CHARS} characters.`);
        return;
      }

      setError(null);
      const userMsg: ConversationMessage = { role: "user", content: trimmed };
      setMessages((m) => [...m, userMsg]);
      setStatus("sending");

      try {
        const reply = await sendMessage(conversationId, trimmed, model, responseStyle);
        await revealAssistantReply(reply.content, reply.sources ?? []);
        const latestList = await listConversations();
        setThreads(latestList.items);
        setStatus("idle");
      } catch (e) {
        setMessages((m) => m.slice(0, -1));
        setStatus("idle");
        setError(e instanceof ApiError ? e.message : "Message failed");
      }
    },
    [conversationId, revealAssistantReply]
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
