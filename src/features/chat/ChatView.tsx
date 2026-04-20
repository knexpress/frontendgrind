import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { fetchModelOptions, type ModelAlias, type ModelOption, type ResponseStyle } from "../../api/conversations";
import { MessageList } from "./MessageList";
import { Composer } from "./Composer";
import { useChatSession } from "./useChatSession";
import "./chat.css";

export function ChatView() {
  const auth = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { conversationId, threads, messages, status, error, send, retry, openConversation, createNewConversation } =
    useChatSession(auth.user!.id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const openedFromUrlRef = useRef<string | null>(null);
  const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelAlias>("Chat");
  const [selectedResponseStyle, setSelectedResponseStyle] = useState<ResponseStyle>("auto");
  const [query, setQuery] = useState("");
  const [recentsQuery, setRecentsQuery] = useState("");
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">("idle");

  const isRecentsView = location.pathname.startsWith("/chat/recents");
  const busy = status === "loading" || status === "sending";
  const showTyping = status === "sending";
  const sessionLoading = status === "loading";
  const visibleThreads = threads
    .filter((t) => Boolean(t.title.trim() || t.lastMessagePreview.trim()))
    .filter((t) => {
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return t.title.toLowerCase().includes(q) || t.lastMessagePreview.toLowerCase().includes(q);
    });
  const hasMessages = messages.length > 0 || sessionLoading;
  const recentsItems = threads
    .filter((t) => Boolean(t.title.trim() || t.lastMessagePreview.trim()))
    .filter((t) => {
      if (!recentsQuery.trim()) return true;
      const q = recentsQuery.trim().toLowerCase();
      return t.title.toLowerCase().includes(q) || t.lastMessagePreview.toLowerCase().includes(q);
    });

  const greetingName = auth.user?.fullName?.trim().split(/\s+/)[0] ?? "there";

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

  useEffect(() => {
    const idFromUrl = searchParams.get("c");
    if (!idFromUrl) return;
    if (openedFromUrlRef.current === idFromUrl) return;
    openedFromUrlRef.current = idFromUrl;
    void openConversation(idFromUrl);
  }, [openConversation, searchParams]);

  useEffect(() => {
    if (!conversationId) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (next.get("c") === conversationId) return prev;
      next.set("c", conversationId);
      return next;
    });
  }, [conversationId, setSearchParams]);

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

  async function handleOpenConversation(id: string) {
    await openConversation(id);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("c", id);
      return next;
    });
  }

  async function handleNewChat() {
    await createNewConversation();
  }

  async function handleShare() {
    if (!conversationId) return;
    try {
      const url = `${window.location.origin}/chat?c=${encodeURIComponent(conversationId)}`;
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      window.setTimeout(() => setShareState("idle"), 1800);
    } catch {
      setShareState("error");
      window.setTimeout(() => setShareState("idle"), 2000);
    }
  }

  return (
    <div className="chat-shell">
      <div className="chat-body chat-body--claude">
        <aside className="chat-sidebar chat-sidebar--claude">
          <div className="chat-sidebar__logo">Grind</div>

          <nav className="chat-nav" aria-label="Primary">
            <button type="button" className="chat-nav__item" onClick={() => void handleNewChat()}>
              + New chat
            </button>
            <label className="chat-nav__search">
              <span className="sr-only">Search chats</span>
              <input
                type="search"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search chat history"
              />
            </label>
            <div className="chat-nav__item chat-nav__item--muted">Chats</div>
            <Link
              className={`chat-nav__item chat-nav__item--link${isRecentsView ? " is-active" : ""}`}
              to="/chat/recents"
            >
              Recents
            </Link>
          </nav>

          <div className="chat-sidebar__threads">
            <div className="chat-sidebar__header">
              <h2>Your chats</h2>
            </div>
            <ul className="chat-thread-list">
              {visibleThreads.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className={`chat-thread-item${conversationId === t.id ? " is-active" : ""}`}
                    onClick={() => void handleOpenConversation(t.id)}
                  >
                    <strong>{t.title || "Untitled chat"}</strong>
                    <span>{t.lastMessagePreview || "No messages yet"}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="chat-sidebar__footer">
            <Link to="/" className="chat-nav__item chat-nav__item--link">
              Back home
            </Link>
            <button type="button" className="chat-nav__item" onClick={() => void auth.logout()}>
              Sign out
            </button>
          </div>
        </aside>

        <main className="chat-layout chat-layout--claude">
          {isRecentsView ? (
            <section className="recents-inline">
              <div className="recents-inline__top">
                <h1>Recents</h1>
                <Link className="recents-inline__back" to="/chat">
                  Back to chat
                </Link>
              </div>
              <p className="recents-inline__sub">Search old conversations and open them instantly.</p>
              <label className="recents-inline__search">
                <span className="sr-only">Search old conversations</span>
                <input
                  type="search"
                  placeholder="Search old conversations"
                  value={recentsQuery}
                  onChange={(e) => setRecentsQuery(e.target.value)}
                />
              </label>
              <ul className="recents-inline__list">
                {recentsItems.map((item) => (
                  <li key={item.id}>
                    <Link className="recents-inline__item" to={`/chat?c=${encodeURIComponent(item.id)}`}>
                      <strong>{item.title || "Untitled chat"}</strong>
                      <span>{item.lastMessagePreview || "No message preview available."}</span>
                    </Link>
                  </li>
                ))}
                {recentsItems.length === 0 ? (
                  <li className="recents-inline__empty">No matching conversations found.</li>
                ) : null}
              </ul>
            </section>
          ) : (
            <>
              <div className="chat-main-header">
                <button
                  type="button"
                  className="chat-share-btn"
                  onClick={() => void handleShare()}
                  disabled={!conversationId}
                >
                  {shareState === "copied"
                    ? "Link copied"
                    : shareState === "error"
                      ? "Copy failed"
                      : "Share chat"}
                </button>
              </div>

              {!hasMessages ? (
                <section className="chat-empty-hero">
                  <h1 className="chat-empty-hero__title">Good afternoon, {greetingName}</h1>
                  <p className="chat-empty-hero__sub">How can I help you today?</p>
                  <div className="chat-empty-hero__composer">
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
                </section>
              ) : (
                <>
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
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
