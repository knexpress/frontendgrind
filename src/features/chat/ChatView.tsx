import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { fetchModelOptions, type ModelAlias, type ModelOption } from "../../api/conversations";
import { MessageList } from "./MessageList";
import { Composer } from "./Composer";
import { IntakeQuestionnaire } from "./IntakeQuestionnaire";
import { useChatSession } from "./useChatSession";
import "./chat.css";

function intakeClosedInStorage(conversationId: string): boolean {
  return (
    sessionStorage.getItem(`grind_intake_skipped_${conversationId}`) === "1" ||
    sessionStorage.getItem(`grind_intake_done_${conversationId}`) === "1"
  );
}

export function ChatView() {
  const auth = useAuth();
  const { conversationId, messages, status, error, send, retry } = useChatSession(auth.user!.id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [intakeDismissed, setIntakeDismissed] = useState(false);
  const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelAlias>("Chat");

  const busy = status === "loading" || status === "sending";
  const showTyping = status === "sending";
  const sessionLoading = status === "loading";

  useEffect(() => {
    setIntakeDismissed(false);
  }, [conversationId]);

  const showIntake = useMemo(() => {
    if (!conversationId || status !== "idle" || sessionLoading || error) return false;
    if (messages.length > 0) return false;
    if (intakeDismissed) return false;
    return !intakeClosedInStorage(conversationId);
  }, [conversationId, status, sessionLoading, error, messages.length, intakeDismissed]);

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
    <div className={`chat-shell${showIntake ? " chat-shell--intake" : ""}`}>
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

        {!showIntake && (
          <div className="chat-composer-wrap">
            <Composer
              disabled={busy}
              modelOptions={effectiveModelOptions}
              selectedModel={selectedModel}
              onChangeModel={setSelectedModel}
              onSend={(t, model) => void send(t, model)}
            />
          </div>
        )}
      </div>

      {showIntake && conversationId ? (
        <IntakeQuestionnaire
          key={conversationId}
          conversationId={conversationId}
          onSubmit={(text) => send(text, selectedModel)}
          onDismiss={() => setIntakeDismissed(true)}
        />
      ) : null}
    </div>
  );
}
