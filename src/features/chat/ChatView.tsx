import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { MessageList } from "./MessageList";
import { Composer } from "./Composer";
import { useChatSession } from "./useChatSession";
import "./chat.css";

export function ChatView() {
  const { messages, status, error, send, retry } = useChatSession();
  const scrollRef = useRef<HTMLDivElement>(null);

  const busy = status === "loading" || status === "sending";
  const showTyping = status === "sending";
  const sessionLoading = status === "loading";

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, showTyping, sessionLoading, error]);

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
        <div className="chat-topbar__spacer" aria-hidden="true" />
      </header>

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
          />
        </div>

        <div className="chat-composer-wrap">
          <Composer disabled={busy} onSend={(t) => void send(t)} />
        </div>
      </div>
    </div>
  );
}
