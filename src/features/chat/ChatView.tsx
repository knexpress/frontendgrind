import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { fetchModelOptions, type ModelAlias, type ModelOption, type ResponseStyle } from "../../api/conversations";
import { MessageList } from "./MessageList";
import { Composer } from "./Composer";
import { useChatSession } from "./useChatSession";
import "./chat.css";

export function ChatView() {
  const auth = useAuth();
  const { conversationId, threads, messages, status, error, send, retry, openConversation, createNewConversation } =
    useChatSession(auth.user!.id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelAlias>("Chat");
  const [selectedResponseStyle, setSelectedResponseStyle] = useState<ResponseStyle>("auto");

  const busy = status === "loading" || status === "sending";
  const showTyping = status === "sending";
  const sessionLoading = status === "loading";
  const visibleThreads = threads.filter((t) => Boolean(t.title.trim() || t.lastMessagePreview.trim()));

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, showTyping, sessionLoading, error]);

  useEffect(() => {
    let mounted = true;
    async function loadModels() {
      try {
        const data = await fetchModelOptions();
        if (!mounted) return;
        if (data.items.length > 0) {
          setModelOptions(data.items);
          setSelectedModel(data.items[0]!.alias);
        }
      } catch {
        // keep default
      }
    }
    void loadModels();
    return () => {
      mounted = false;
    };
  }, []);

  const effectiveModelOptions: ModelOption[] =
    modelOptions.length > 0
      ? modelOptions
      : [
          { alias: "Chat", description: "General-purpose chat model" },
          { alias: "Thinking", description: "Reasoning-focused model" },
          { alias: "Thinking2.0", description: "Upgraded deep-thinking model" },
          { alias: "Flash-Lite", description: "Fast and efficient model" },
          { alias: "Flash-Omni", description: "Omni model for broader capabilities" },
          { alias: "Flash-Chat", description: "Latest high-performance chat model" },
        ];

  return (
    <div className="chat-shell">
      <header className="chat-topbar">
        <Link to="/" className="chat-topbar__back">
          <span className="chat-topbar__back-icon" aria-hidden="true" />
          Home
        </Link>
        <div className="chat-topbar__brand">
          <h1 className="chat-topbar__title">GRIND</h1>
          <p className="chat-topbar__tag">Strategist chat</p>
        </div>
        <button
          type="button"
          className="chat-topbar__logout"
          onClick={() => void auth.logout()}
          title={auth.user?.email || "Sign out"}
        >
          Sign out
        </button>
      </header>

      <div className="chat-body">
        <aside className="chat-sidebar">
          <div className="chat-sidebar__header">
            <h2>Chats</h2>
            <button type="button" className="chat-sidebar__new" onClick={() => void createNewConversation()}>
              New chat
            </button>
          </div>
          <ul className="chat-thread-list">
            {visibleThreads.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={`chat-thread-item${conversationId === t.id ? " is-active" : ""}`}
                  onClick={() => void openConversation(t.id)}
                >
                  <strong>{t.title || "Untitled chat"}</strong>
                  <span>{t.lastMessagePreview || "No messages yet"}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="chat-layout">
          <div ref={scrollRef} className="chat-messages-wrap">
            {error && status !== "loading" && (
              <div className="banner banner--error banner--enter">
                <span>{error}</span>
                <button type="button" className="link-button" onClick={() => void retry()}>
                  Retry
                </button>
              </div>
            )}
            <MessageList
              messages={messages}
              showTyping={showTyping}
              sessionLoading={sessionLoading}
              choiceDisabled={busy}
              onChooseAnswer={(text) => void send(text, selectedModel, selectedResponseStyle)}
            />
          </div>

          <div className="chat-composer-wrap">
            <Composer
              disabled={busy}
              modelOptions={effectiveModelOptions}
              selectedModel={selectedModel}
              onChangeModel={setSelectedModel}
              selectedResponseStyle={selectedResponseStyle}
              onChangeResponseStyle={setSelectedResponseStyle}
              onSend={(t, model, responseStyle) => void send(t, model, responseStyle)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
