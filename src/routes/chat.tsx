import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Copy,
  Home,
  ImagePlus,
  LogOut,
  Mic,
  PenLine,
  RotateCcw,
  Settings,
  User,
} from "lucide-react";
import { RequireOnboardingComplete } from "@/components/auth/RouteGuards";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import {
  ApiError,
  chatApi,
  type Conversation,
  type ConversationListItem,
  type ModelOption,
} from "@/lib/api";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: {
      transcript: string;
    };
  }>;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

const getSpeechRecognitionCtor = (): SpeechRecognitionCtor | null => {
  if (typeof window === "undefined") return null;
  const withSpeech = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return withSpeech.SpeechRecognition ?? withSpeech.webkitSpeechRecognition ?? null;
};

function ChatPage() {
  const cleanPartPrefix = (value: string): string =>
    value
      .trim()
      .replace(/^\d+\s*[.)-]\s*/, "")
      .replace(/^[-*]\s+/, "")
      .trim();

  const compactParts = (parts: string[]): string[] => {
    const cleaned = parts.map(cleanPartPrefix).filter(Boolean);
    if (cleaned.length <= 1) return cleaned;

    const merged: string[] = [];
    for (let i = 0; i < cleaned.length; i += 1) {
      const current = cleaned[i]!;
      const next = cleaned[i + 1];
      const isHeadingLike =
        current.length <= 90 &&
        (current.endsWith(":") || !/[.!?]$/.test(current));

      if (isHeadingLike && next) {
        merged.push(`${current} ${next}`.replace(/\s+/g, " ").trim());
        i += 1;
      } else {
        merged.push(current);
      }
    }
    return merged;
  };

  const { accessToken, user, logout } = useAuth();
  const [models, setModels] = useState<ModelOption[]>([]);
  const [conversations, setConversations] = useState<ConversationListItem[]>(
    [],
  );
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [responseStyle, setResponseStyle] = useState<
    "auto" | "short" | "bullet" | "detailed"
  >("auto");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [sidebarQuery, setSidebarQuery] = useState("");
  const [isRecentsView, setIsRecentsView] = useState(false);
  const [imagePickerKey, setImagePickerKey] = useState(0);
  const [copiedMessageKey, setCopiedMessageKey] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [assistantStepProgress, setAssistantStepProgress] = useState<
    Record<string, number>
  >({});
  const [expandedAssistantMessages, setExpandedAssistantMessages] = useState<
    Record<string, boolean>
  >({});
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const imagePreviewUrl = useMemo(
    () => (image ? URL.createObjectURL(image) : null),
    [image],
  );

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const handleVoiceInput = () => {
    const SpeechRecognition = getSpeechRecognitionCtor();
    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser.");
      return;
    }

    setError("");

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";
    const baseMessage = message.trim();

    recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) {
          finalTranscript += text;
        } else {
          interimTranscript += text;
        }
      }
      const merged = `${finalTranscript} ${interimTranscript}`.trim();
      setMessage(`${baseMessage}${baseMessage && merged ? " " : ""}${merged}`);
    };

    recognition.onerror = () => {
      setError("Couldn't capture voice input. Please try again.");
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    setIsListening(true);
    recognition.start();
  };

  const parseResponseParts = (text: string): string[] => {
    const normalizedForNumberedParsing = text
      .replace(/\r/g, "")
      .replace(/\s+(?=\d+[.)-]\s*)/g, "\n")
      .replace(/(\d+[.)-])(?=[^\s])/g, "$1 ");

    const numberedSteps = normalizedForNumberedParsing
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => /^\d+[.)-]\s+/.test(line))
      .map((line) => line.replace(/^\d+[.)-]\s+/, "").trim());

    if (numberedSteps.length >= 2) return compactParts(numberedSteps);

    const bulletSteps = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => /^[-*]\s+/.test(line))
      .map((line) => line.replace(/^[-*]\s+/, "").trim());

    if (bulletSteps.length >= 2) return compactParts(bulletSteps);

    const paragraphParts = text
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean);
    if (paragraphParts.length >= 2) return compactParts(paragraphParts);

    const sentenceParts = text
      .split(/(?<=[.!?])\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
    if (sentenceParts.length >= 3) {
      const grouped: string[] = [];
      for (let i = 0; i < sentenceParts.length; i += 2) {
        grouped.push(sentenceParts.slice(i, i + 2).join(" "));
      }
      return compactParts(grouped);
    }

    return [];
  };

  const stripInlineSourceText = (
    text: string,
    sources?: Array<{ title: string; url: string; snippet?: string }>,
  ): string => {
    let cleaned = text;
    if (sources?.length) {
      for (const source of sources) {
        if (source.url) {
          cleaned = cleaned.replaceAll(source.url, "");
        }
        if (source.title) {
          cleaned = cleaned.replaceAll(`${source.title} - `, "");
          cleaned = cleaned.replaceAll(` - ${source.title}`, "");
        }
      }
    }
    return cleaned
      .replace(/\(\s*Source:[^)]+\)/gi, "")
      // Keep line breaks so long replies can stay organized in the UI.
      .replace(/[^\S\r\n]{2,}/g, " ")
      .replace(/\s+,/g, ",")
      .replace(/,\s*,/g, ", ")
      .replace(/[,\s]+$/g, "")
      .trim();
  };

  useEffect(() => {
    const loadInitial = async () => {
      if (!accessToken) return;
      try {
        const [modelRes, convRes] = await Promise.all([
          chatApi.getModels(accessToken),
          chatApi.listConversations(accessToken),
        ]);
        setModels(modelRes.items);
        setSelectedModel(modelRes.items[0]?.alias ?? "");
        setConversations(convRes.items);

        if (convRes.items[0]) {
          const full = await chatApi.getConversation(
            accessToken,
            convRes.items[0].id,
          );
          setActiveConversation(full);
        } else {
          const created = await chatApi.createConversation(accessToken);
          const firstConversation = await chatApi.getConversation(
            accessToken,
            created.id,
          );
          const refreshedList = await chatApi.listConversations(accessToken);
          setConversations(refreshedList.items);
          setActiveConversation(firstConversation);
        }
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Unable to load chat.");
      }
    };

    void loadInitial();
  }, [accessToken]);

  const handleCreateConversation = async () => {
    if (!accessToken || busy) return;
    setError("");
    setBusy(true);
    try {
      const created = await chatApi.createConversation(accessToken);
      const conv = await chatApi.getConversation(accessToken, created.id);
      const list = await chatApi.listConversations(accessToken);
      setConversations(list.items);
      setActiveConversation(conv);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Unable to create conversation.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleOpenConversation = async (id: string) => {
    if (!accessToken || busy) return;
    setError("");
    setBusy(true);
    try {
      const conv = await chatApi.getConversation(accessToken, id);
      setActiveConversation(conv);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Unable to open conversation.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    if (!accessToken || busy || !activeConversation) return;
    const content = message.trim();
    if (!content && !image) return;

    setError("");
    setBusy(true);
    try {
      const originalMessages = activeConversation.messages;
      const optimisticMessages = [
        ...originalMessages,
        { role: "user" as const, content },
      ];
      setActiveConversation({
        ...activeConversation,
        messages: optimisticMessages,
      });

      const reply = await chatApi.sendMessage(
        accessToken,
        activeConversation.id,
        {
          content: content || "Attached image for context.",
          model: selectedModel || undefined,
          responseStyle,
        },
        image,
      );
      const refreshed = await chatApi.getConversation(
        accessToken,
        activeConversation.id,
      );
      const mergedMessages = [...refreshed.messages];
      if (
        !mergedMessages.length ||
        mergedMessages[mergedMessages.length - 1].role !== "assistant"
      ) {
        mergedMessages.push(reply);
      }
      setActiveConversation({ ...refreshed, messages: mergedMessages });
      setMessage("");
      setImage(null);
      setEditingIndex(null);
      const list = await chatApi.listConversations(accessToken);
      setConversations(list.items);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Unable to send message.");
    } finally {
      setBusy(false);
    }
  };

  const handleRegenerate = async (index: number) => {
    if (!accessToken || !activeConversation || busy) return;
    const target = activeConversation.messages[index];
    if (!target || target.role !== "user") return;

    setError("");
    setBusy(true);
    try {
      await chatApi.editMessage(accessToken, activeConversation.id, index, {
        content: target.content,
        model: selectedModel || undefined,
        responseStyle,
      });
      const refreshed = await chatApi.getConversation(
        accessToken,
        activeConversation.id,
      );
      setActiveConversation(refreshed);
      const list = await chatApi.listConversations(accessToken);
      setConversations(list.items);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Unable to regenerate response.",
      );
    } finally {
      setBusy(false);
    }
  };

  const title = useMemo(
    () => activeConversation?.title ?? "No conversation",
    [activeConversation],
  );
  const visibleConversations = useMemo(() => {
    const withMessages = conversations.filter(
      (item) => item.lastMessagePreview.trim().length > 0,
    );
    const q = sidebarQuery.trim().toLowerCase();
    if (!q) return withMessages;
    return withMessages.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.lastMessagePreview.toLowerCase().includes(q),
    );
  }, [conversations, sidebarQuery]);

  const greetingName = useMemo(() => {
    const name = user?.fullName?.trim();
    return name ? name.split(/\s+/)[0] : "there";
  }, [user?.fullName]);

  return (
    <RequireOnboardingComplete>
      <main className="min-h-screen bg-background text-foreground">
        <div className="grid min-h-screen grid-cols-1 md:grid-cols-[260px_1fr]">
          <aside className="chat-edge-strong flex min-h-screen flex-col border-b border-border/60 bg-card/50 p-3 shadow-sm md:sticky md:top-0 md:h-screen md:min-h-0 md:border-b-0 md:border-r md:border-border/70 md:shadow-none">
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="text-2xl font-semibold tracking-tight">GRIND</div>
              <ThemeToggle />
            </div>

            <nav className="space-y-1">
              <button
                className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent/40"
                onClick={() => {
                  setIsRecentsView(false);
                  void handleCreateConversation();
                }}
              >
                + New chat
              </button>
              <label className="block">
                <span className="sr-only">Search chats</span>
                <input
                  type="search"
                  placeholder="Search chats"
                  value={sidebarQuery}
                  onChange={(e) => setSidebarQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring/50 focus:ring"
                />
              </label>
              <button
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  isRecentsView
                    ? "border border-border/70 bg-accent/35 text-foreground"
                    : "text-muted-foreground hover:bg-accent/40"
                }`}
                onClick={() => setIsRecentsView(true)}
              >
                Recents
              </button>
            </nav>

            <div className="mt-4">
              <p className="mb-2 px-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                Your chats
              </p>
              <div className="max-h-[42vh] space-y-1 overflow-auto pr-1 md:max-h-[62vh] md:flex-1">
                {visibleConversations.map((item) => (
                  <button
                    key={item.id}
                    className={`w-full rounded-lg px-3 py-2 text-left text-xs transition ${
                      activeConversation?.id === item.id && !isRecentsView
                        ? "border border-border/70 bg-accent/35 text-foreground"
                        : "text-muted-foreground hover:bg-accent/40"
                    }`}
                    onClick={() => {
                      setIsRecentsView(false);
                      void handleOpenConversation(item.id);
                    }}
                  >
                    <p className="truncate font-medium text-foreground">
                      {item.title}
                    </p>
                    <p className="truncate">
                      {item.lastMessagePreview || "No messages yet"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto flex flex-col items-stretch gap-2 border-t border-border/70 pt-4">
              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-muted-foreground hover:bg-accent/40 hover:text-foreground"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <Link
                to="/home"
                className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-muted-foreground hover:bg-accent/40 hover:text-foreground"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                to="/settings"
                className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-muted-foreground hover:bg-accent/40 hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-sm text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                onClick={() => void logout()}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </aside>

          <section className="flex min-h-screen flex-1 px-3 py-4 md:px-6 md:py-6">
            <div className="flex h-full min-h-0 w-full flex-1 flex-col">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-semibold">
                    {isRecentsView ? "Recents" : title}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {isRecentsView
                      ? "Browse and reopen previous conversations quickly."
                      : "Run your strategy with GRIND chat."}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-accent/50 disabled:opacity-50"
                  onClick={() => {
                    if (!activeConversation?.id) return;
                    const shareUrl = `${window.location.origin}/chat?c=${encodeURIComponent(activeConversation.id)}`;
                    void navigator.clipboard.writeText(shareUrl);
                  }}
                  disabled={!activeConversation?.id}
                >
                  Share chat
                </button>
              </div>

              {isRecentsView ? (
                <div className="chat-edge-strong flex-1 min-h-0 space-y-2 overflow-auto rounded-xl border border-border bg-card/40 p-3">
                  {visibleConversations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No matching conversations found.
                    </p>
                  ) : (
                    visibleConversations.map((item) => (
                      <button
                        key={item.id}
                        className="w-full rounded-lg border border-border bg-background/70 px-3 py-3 text-left hover:bg-accent/40"
                        onClick={() => {
                          setIsRecentsView(false);
                          void handleOpenConversation(item.id);
                        }}
                      >
                        <p className="text-sm font-semibold">
                          {item.title || "Untitled chat"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {item.lastMessagePreview || "No preview available."}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <>
                  {!activeConversation?.messages.length ? (
                    <div className="chat-edge-strong mb-4 flex min-h-[280px] flex-1 items-center justify-center rounded-xl border border-border bg-card/30 p-4 shadow-sm">
                      <div className="w-full max-w-2xl text-center">
                        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                          Good{" "}
                          {new Date().getHours() < 12 ? "morning" : "afternoon"}
                          , {greetingName}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          How can I help you today?
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="chat-edge-strong mb-4 min-h-[280px] flex-1 overflow-y-auto rounded-xl border border-border bg-card/30 p-3 shadow-sm">
                      <div className="space-y-3">
                        {activeConversation.messages.map((msg, index) => (
                          <div
                            key={`${msg.role}-${index}`}
                            className={`chat-edge-strong w-full rounded-xl border border-border/60 p-3 text-left text-sm shadow-sm ${
                              msg.role === "assistant"
                                ? "bg-secondary/70"
                                : "bg-primary/10"
                            }`}
                          >
                            <div className="mb-1 flex items-center justify-between">
                              <strong className="text-xs uppercase text-muted-foreground">
                                {msg.role}
                              </strong>
                            </div>
                            {msg.role === "assistant" ? (
                              (() => {
                                const displayContent = stripInlineSourceText(
                                  msg.content,
                                  msg.sources,
                                );
                                const steps = parseResponseParts(displayContent);
                                if (steps.length < 2) {
                                  return (
                                    <p className="whitespace-pre-wrap leading-relaxed">
                                      {displayContent}
                                    </p>
                                  );
                                }
                                const messageKey = `${activeConversation?.id ?? "chat"}-${index}`;
                                const currentStep = Math.min(
                                  assistantStepProgress[messageKey] ?? 0,
                                  steps.length - 1,
                                );
                                const isExpanded = Boolean(
                                  expandedAssistantMessages[messageKey],
                                );
                                const allSources = (msg.sources ?? []).slice(0, 3);
                                const stepSource =
                                  allSources.length > 0
                                    ? allSources[
                                        Math.min(currentStep, allSources.length - 1)
                                      ]
                                    : null;
                                return (
                                  <div className="space-y-2">
                                    {isExpanded ? (
                                      <div className="space-y-2 rounded-lg border border-border/70 bg-background/70 px-3 py-2">
                                        <p className="whitespace-pre-wrap leading-relaxed">
                                          {displayContent}
                                        </p>
                                        {allSources.length ? (
                                          <div className="flex flex-wrap gap-1.5">
                                            {allSources.map((source) => (
                                              <a
                                                key={`${source.url}-${source.title}`}
                                                href={source.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={(event) =>
                                                  event.stopPropagation()
                                                }
                                                className="inline-flex max-w-full items-center rounded-md border border-border bg-card px-2 py-1 text-[11px] text-foreground shadow-[0_0_0_1px_rgba(212,175,55,0.12),0_0_12px_rgba(212,175,55,0.12)] transition hover:bg-accent/40 hover:shadow-[0_0_0_1px_rgba(212,175,55,0.22),0_0_20px_rgba(212,175,55,0.2)]"
                                                title={source.title}
                                              >
                                                <span className="truncate">
                                                  {source.title}
                                                </span>
                                              </a>
                                            ))}
                                          </div>
                                        ) : null}
                                      </div>
                                    ) : (
                                      <div className="space-y-2 rounded-lg border border-border/70 bg-background/70 px-3 py-2">
                                        <p className="whitespace-pre-wrap leading-relaxed">
                                          {steps[currentStep]}
                                        </p>
                                        {stepSource ? (
                                          <div className="flex flex-wrap gap-1.5">
                                            <a
                                              href={stepSource.url}
                                              target="_blank"
                                              rel="noreferrer"
                                              onClick={(event) =>
                                                event.stopPropagation()
                                              }
                                              className="inline-flex max-w-full items-center rounded-md border border-border bg-card px-2 py-1 text-[11px] text-foreground shadow-[0_0_0_1px_rgba(212,175,55,0.12),0_0_12px_rgba(212,175,55,0.12)] transition hover:bg-accent/40 hover:shadow-[0_0_0_1px_rgba(212,175,55,0.22),0_0_20px_rgba(212,175,55,0.2)]"
                                              title={stepSource.title}
                                            >
                                              <span className="truncate">
                                                {stepSource.title}
                                              </span>
                                            </a>
                                          </div>
                                        ) : null}
                                      </div>
                                    )}
                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        {isExpanded ? (
                                          <span>Full reply</span>
                                        ) : (
                                          <span>
                                            Step {currentStep + 1} of {steps.length}
                                          </span>
                                        )}
                                        <button
                                          type="button"
                                          className="text-[11px] text-primary underline-offset-2 hover:underline"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            setExpandedAssistantMessages((prev) => ({
                                              ...prev,
                                              [messageKey]: !isExpanded,
                                            }));
                                          }}
                                        >
                                          {isExpanded ? "Show steps" : "Show full reply"}
                                        </button>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {!isExpanded ? (
                                          <>
                                            <button
                                              type="button"
                                              disabled={currentStep === 0}
                                              className="rounded-md border border-border/70 bg-background px-2 py-1 text-foreground hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                setAssistantStepProgress((prev) => ({
                                                  ...prev,
                                                  [messageKey]: Math.max(
                                                    (prev[messageKey] ?? 0) - 1,
                                                    0,
                                                  ),
                                                }));
                                              }}
                                            >
                                              Previous
                                            </button>
                                            <button
                                              type="button"
                                              disabled={currentStep >= steps.length - 1}
                                              className="rounded-md border border-border/70 bg-background px-2 py-1 text-foreground hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                setAssistantStepProgress((prev) => ({
                                                  ...prev,
                                                  [messageKey]: Math.min(
                                                    (prev[messageKey] ?? 0) + 1,
                                                    steps.length - 1,
                                                  ),
                                                }));
                                              }}
                                            >
                                              Next
                                            </button>
                                          </>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()
                            ) : (
                              <button
                                type="button"
                                className="w-full text-left"
                                onClick={() => {
                                  setEditingIndex(index);
                                  setMessage(msg.content);
                                }}
                              >
                                <p className="whitespace-pre-wrap leading-relaxed">
                                  {msg.content}
                                </p>
                              </button>
                            )}
                            {msg.role === "user" ? (
                              <div className="mt-2 inline-flex items-center gap-2 text-primary">
                                <button
                                  type="button"
                                  aria-label="Copy message"
                                  title="Copy message"
                                  className="inline-flex items-center text-primary hover:text-primary/80"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    void navigator.clipboard
                                      .writeText(msg.content)
                                      .then(() => {
                                        const key = `${index}-${msg.content}`;
                                        setCopiedMessageKey(key);
                                        window.setTimeout(
                                          () => setCopiedMessageKey(null),
                                          1400,
                                        );
                                      });
                                  }}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Edit message"
                                  title="Edit message"
                                  className="inline-flex items-center text-primary hover:text-primary/80"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setEditingIndex(index);
                                    setMessage(msg.content);
                                  }}
                                >
                                  <PenLine className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Regenerate assistant reply"
                                  title="Regenerate assistant reply"
                                  className="inline-flex items-center text-primary hover:text-primary/80"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    void handleRegenerate(index);
                                  }}
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                </button>
                                {copiedMessageKey === `${index}-${msg.content}` ? (
                                  <span className="text-[11px]">Copied</span>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <form className="space-y-2" onSubmit={handleSend}>
                    {image ? (
                      <div className="chat-edge-strong rounded-xl border border-border bg-card/40 p-2">
                        <div className="mb-2 flex items-center justify-between px-1 text-xs text-muted-foreground">
                          <span className="truncate">Attached: {image.name}</span>
                          <button
                            type="button"
                            className="text-primary hover:underline"
                            onClick={() => {
                              setImage(null);
                              setImagePickerKey((prev) => prev + 1);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                        {imagePreviewUrl ? (
                          <img
                            src={imagePreviewUrl}
                            alt={image.name}
                            className="max-h-36 w-full rounded-lg border border-border/70 object-cover"
                          />
                        ) : null}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <select
                          className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                        >
                          {models.map((m) => (
                            <option key={m.alias} value={m.alias}>
                              {m.alias}
                            </option>
                          ))}
                        </select>
                        <select
                          className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                          value={responseStyle}
                          onChange={(e) =>
                            setResponseStyle(
                              e.target.value as
                                | "auto"
                                | "short"
                                | "bullet"
                                | "detailed",
                            )
                          }
                        >
                          <option value="auto">Auto</option>
                          <option value="short">Short</option>
                          <option value="bullet">Bullet</option>
                          <option value="detailed">Detailed</option>
                        </select>
                      </div>
                    </div>

                    <div className="relative">
                      <textarea
                        className="chat-edge-strong h-24 w-full rounded-xl border border-border bg-background px-3 py-2 pb-12 pr-24 text-sm shadow-sm outline-none ring-ring/50 focus:ring"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            e.currentTarget.form?.requestSubmit();
                          }
                        }}
                        placeholder={
                          editingIndex !== null
                            ? "Edit your message and send again..."
                            : "Ask GRIND anything..."
                        }
                      />
                      <div className="absolute right-2 top-2 flex items-center gap-1">
                        <button
                          type="button"
                          aria-label={isListening ? "Stop voice input" : "Voice input"}
                          title={isListening ? "Stop voice input" : "Voice input"}
                          className={`chat-edge-strong inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card shadow-sm hover:bg-accent/50 hover:text-foreground ${
                            isListening
                              ? "text-primary ring-1 ring-primary/40"
                              : "text-muted-foreground"
                          }`}
                          onClick={handleVoiceInput}
                        >
                          <Mic className="h-3.5 w-3.5" />
                        </button>
                        <label className="chat-edge-strong inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-sm hover:bg-accent/50 hover:text-foreground">
                          <ImagePlus className="h-3.5 w-3.5" />
                          <span className="sr-only">Attach image</span>
                          <input
                            key={imagePickerKey}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                          />
                        </label>
                      </div>
                      <button
                        type="submit"
                        disabled={busy || !activeConversation}
                        className="absolute bottom-2 right-2 rounded-lg bg-gold-gradient px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                      >
                        {busy
                          ? "Working..."
                          : editingIndex !== null
                            ? "Update"
                            : "Send"}
                      </button>
                    </div>

                  </form>
                  {error ? (
                    <p className="mt-3 text-sm text-destructive">{error}</p>
                  ) : null}
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </RequireOnboardingComplete>
  );
}
