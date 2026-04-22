import { useState } from "react";
import type { ReactNode } from "react";
import type { ConversationMessage } from "../../api/conversations";
import { TypingIndicator } from "./TypingIndicator";

type Props = {
  messages: ConversationMessage[];
  showTyping: boolean;
  sessionLoading: boolean;
  choiceDisabled: boolean;
  onChooseAnswer: (text: string) => void;
  onEditUserMessage: (messageIndex: number, text: string) => void;
  onRegenerateUserMessage: (messageIndex: number, text: string) => void;
  editDisabled: boolean;
};

type ParsedChoiceQuestion = {
  question: string;
  options: string[];
};

function parseChoiceQuestions(content: string): ParsedChoiceQuestion[] {
  const lines = content.split("\n");
  const parsed: ParsedChoiceQuestion[] = [];

  let i = 0;
  while (i < lines.length) {
    const numbered = lines[i]?.match(/^\s*\d+\.\s+(.+)$/);
    if (!numbered) {
      i += 1;
      continue;
    }

    const question = numbered[1].trim();
    i += 1;

    const optionLines: string[] = [];
    while (i < lines.length) {
      const line = lines[i] ?? "";
      if (/^\s*\d+\.\s+/.test(line)) break;
      const optionMatch = line.match(/^\s{2,}(?:[A-Ea-e][).:]|Option\s*\d+[):.]?)\s+(.+)$/);
      if (optionMatch?.[1]) {
        optionLines.push(optionMatch[1].trim());
      }
      i += 1;
    }

    if (optionLines.length >= 2) {
      parsed.push({ question, options: optionLines });
    }
  }

  return parsed;
}

function composeSelectedAnswer(question: string, option: string): string {
  return `For your question "${question}", I choose: ${option}`;
}

function parseNumberedSteps(content: string): string[] {
  const lines = content.split("\n");
  const steps: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (/^\s*\d+\.\s+/.test(line)) {
      if (current.length > 0) {
        steps.push(current.join("\n").trim());
      }
      current = [line.replace(/^\s*\d+\.\s+/, "").trim()];
      continue;
    }
    if (current.length > 0) {
      current.push(line.trimEnd());
    }
  }

  if (current.length > 0) {
    steps.push(current.join("\n").trim());
  }

  return steps.filter((s) => s.length > 0);
}

function sanitizeHref(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function normalizeTitleForMatch(input: string): string {
  return input
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findSourceByLine(line: string, sources?: ConversationMessage["sources"]) {
  const sourceList = sources ?? [];
  if (sourceList.length === 0) return null;
  const lineNorm = normalizeTitleForMatch(line);
  if (!lineNorm) return null;
  for (const src of sourceList) {
    const srcNorm = normalizeTitleForMatch(src.title);
    if (!srcNorm) continue;
    if (lineNorm === srcNorm) return src;
    if (lineNorm.includes(srcNorm) || srcNorm.includes(lineNorm)) return src;
  }
  return null;
}

function isStandaloneSourceTitleLine(line: string, sources: ConversationMessage["sources"]): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^source:/i.test(trimmed)) return false;
  if (/https?:\/\//i.test(trimmed)) return false;
  return Boolean(findSourceByLine(trimmed, sources));
}

function renderTextWithReferenceButtons(content: string, sources?: ConversationMessage["sources"]): ReactNode {
  const lines = content.split("\n");
  // Accept both "(Source: title - https://...)" and "Source: title - https://..."
  // with flexible titles that may include hyphens/punctuation.
  const citationPattern = /\(?Source:\s*(.+?)\s*-\s*(https?:\/\/[^\s)]+)\)?/gi;

  const refsByLineIndex = new Map<number, Array<{ title: string; url: string }>>();
  const detachedRefs: Array<{ title: string; url: string }> = [];
  const filteredLines: string[] = [];

  for (const line of lines) {
    if (!isStandaloneSourceTitleLine(line, sources)) {
      filteredLines.push(line);
      continue;
    }
    const matched = findSourceByLine(line, sources);
    const safeUrl = matched ? sanitizeHref(matched.url) : null;
    if (!safeUrl) continue;
    detachedRefs.push({ title: matched?.title || "Source", url: safeUrl });
  }

  // Spread detached bibliography refs across the response body instead of stacking at the end.
  const candidateLineIndexes = filteredLines
    .map((line, idx) => ({ line, idx }))
    .filter(({ line }) => Boolean(line.trim()))
    .map(({ idx }) => idx);
  if (candidateLineIndexes.length > 0 && detachedRefs.length > 0) {
    const totalCandidates = candidateLineIndexes.length;
    const maxPreferredPos = Math.max(0, Math.floor(totalCandidates * 0.72) - 1);
    const preferredIndexes = candidateLineIndexes.slice(0, maxPreferredPos + 1);
    const placementPool = preferredIndexes.length > 0 ? preferredIndexes : candidateLineIndexes;
    const totalPlacement = placementPool.length;
    const totalRefs = detachedRefs.length;
    detachedRefs.forEach((ref, refIdx) => {
      const distributedPos = Math.floor(((refIdx + 1) * totalPlacement) / (totalRefs + 1));
      const targetIndex = placementPool[Math.min(totalPlacement - 1, Math.max(0, distributedPos))]!;
      const list = refsByLineIndex.get(targetIndex) ?? [];
      list.push(ref);
      refsByLineIndex.set(targetIndex, list);
    });
  }

  return (
    <>
      {filteredLines.map((line, lineIndex) => {
        const refs: Array<{ title: string; url: string }> = [];
        const cleaned = line.replace(citationPattern, (_whole, title: string, url: string) => {
          const safeUrl = sanitizeHref(url);
          if (!safeUrl) return "";
          refs.push({ title: title.trim(), url: safeUrl });
          return "";
        });
        const trailingRefs = refsByLineIndex.get(lineIndex) ?? [];
        const allRefs = [...refs, ...trailingRefs];
        const trimmedCleaned = cleaned.replace(/\s{2,}/g, " ").replace(/\s+([,.;:!?])/g, "$1").trimEnd();

        return (
          <span key={`line-${lineIndex}`}>
            {trimmedCleaned}
            {allRefs.map((ref, refIndex) => (
              <a
                key={`line-${lineIndex}-ref-${refIndex}`}
                className="message-inline-ref-btn"
                href={ref.url}
                target="_blank"
                rel="noreferrer noopener"
                title={ref.title || "Reference"}
              >
                {ref.title || "Source"}
              </a>
            ))}
            {lineIndex < filteredLines.length - 1 ? <br /> : null}
          </span>
        );
      })}
    </>
  );
}

export function MessageList({
  messages,
  showTyping,
  sessionLoading,
  choiceDisabled,
  onChooseAnswer,
  onEditUserMessage,
  onRegenerateUserMessage,
  editDisabled,
}: Props) {
  const [stepIndexByMessage, setStepIndexByMessage] = useState<Record<string, number>>({});
  const [expandedByMessage, setExpandedByMessage] = useState<Record<string, boolean>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const showEmptyHint = messages.length === 0 && !sessionLoading && !showTyping;

  return (
    <ul className="message-list">
      {sessionLoading && messages.length === 0 && (
        <li className="message message--assistant message--skeleton" aria-busy="true">
          <span className="message__label">GRIND</span>
          <div className="skeleton-lines">
            <span className="skeleton-line skeleton-line--long" />
            <span className="skeleton-line skeleton-line--medium" />
            <span className="skeleton-line skeleton-line--short" />
          </div>
        </li>
      )}
      {showEmptyHint && (
        <li className="message message--empty message--enter">
          <p>
            GRIND already loaded your onboarding context. Share your current challenge and you will get
            a focused, step-by-step plan without repeating basics.
          </p>
        </li>
      )}
      {messages.map((m, i) => (
        (() => {
          const messageKey = `${i}-${m.role}-${m.content.slice(0, 24)}`;
          const choiceQuestions =
            m.role === "assistant" ? parseChoiceQuestions(m.content) : [];
          const planSteps =
            m.role === "assistant" && choiceQuestions.length === 0 ? parseNumberedSteps(m.content) : [];
          const hasUserReplyAfter = messages
            .slice(i + 1)
            .some((next) => next.role === "user");
          const showChoiceUi = choiceQuestions.length > 0 && !hasUserReplyAfter;
          const canShowStepMode = m.role === "assistant" && !showChoiceUi && planSteps.length >= 2;
          const isExpanded = Boolean(expandedByMessage[messageKey]);
          const activeStepIndex = Math.max(
            0,
            Math.min(planSteps.length - 1, stepIndexByMessage[messageKey] ?? 0)
          );

          return (
            <li
              key={messageKey}
              className={`message message--${m.role} message--enter`}
              style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
            >
              <span className="message__label">{m.role === "user" ? "You" : "GRIND"}</span>
              {m.role === "user" && m.localImagePreviewUrl ? (
                <div className="message-user-image">
                  <img src={m.localImagePreviewUrl} alt={m.localImageName || "Attached image"} />
                </div>
              ) : null}
              {canShowStepMode && !isExpanded ? (
                <div className="message-stepper" aria-label="Step-by-step response">
                  <p className="message-stepper__text">
                    {renderTextWithReferenceButtons(planSteps[activeStepIndex] ?? "", m.sources)}
                  </p>
                  <div className="message-stepper__controls">
                    <button
                      type="button"
                      className="message-stepper__btn"
                      onClick={() =>
                        setStepIndexByMessage((prev) => ({
                          ...prev,
                          [messageKey]: Math.max(0, activeStepIndex - 1),
                        }))
                      }
                      disabled={activeStepIndex === 0}
                    >
                      Previous
                    </button>
                    <span className="message-stepper__count">
                      Step {activeStepIndex + 1} of {planSteps.length}
                    </span>
                    <button
                      type="button"
                      className="message-stepper__btn"
                      onClick={() =>
                        setStepIndexByMessage((prev) => ({
                          ...prev,
                          [messageKey]: Math.min(planSteps.length - 1, activeStepIndex + 1),
                        }))
                      }
                      disabled={activeStepIndex >= planSteps.length - 1}
                    >
                      Next
                    </button>
                  </div>
                  <button
                    type="button"
                    className="message-stepper__toggle"
                    onClick={() => setExpandedByMessage((prev) => ({ ...prev, [messageKey]: true }))}
                  >
                    Show full reply
                  </button>
                </div>
              ) : (
                m.content.trim() ? <p className="message__text">{renderTextWithReferenceButtons(m.content, m.sources)}</p> : null
              )}
              {m.role === "user" ? (
                <div className="message-user-actions">
                  {editingIndex === i ? (
                    <div className="message-user-edit">
                      <textarea
                        className="message-user-edit__input"
                        value={editDraft}
                        rows={3}
                        onChange={(e) => setEditDraft(e.target.value)}
                        disabled={editDisabled}
                      />
                      <div className="message-user-edit__buttons">
                        <button
                          type="button"
                          className="message-user-edit__btn"
                          onClick={() => {
                            setEditingIndex(null);
                            setEditDraft("");
                          }}
                          disabled={editDisabled}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="message-user-edit__btn message-user-edit__btn--primary"
                          onClick={() => {
                            const trimmed = editDraft.trim();
                            if (!trimmed) return;
                            onEditUserMessage(i, trimmed);
                            setEditingIndex(null);
                            setEditDraft("");
                          }}
                          disabled={editDisabled || !editDraft.trim()}
                        >
                          Save and resend
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="message-user-actions__icon-btn"
                        onClick={() => {
                          setEditingIndex(i);
                          setEditDraft(m.content);
                        }}
                        disabled={editDisabled}
                        aria-label="Edit message"
                        title="Edit message"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                          <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5.6 17.1V20Z" />
                          <path d="M13.5 6.5l3 3" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className={`message-user-actions__icon-btn${copiedIndex === i ? " is-success" : ""}`}
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(m.content);
                            setCopiedIndex(i);
                            window.setTimeout(() => setCopiedIndex((prev) => (prev === i ? null : prev)), 1200);
                          } catch {
                            setCopiedIndex(null);
                          }
                        }}
                        disabled={editDisabled || !m.content.trim()}
                        aria-label="Copy message"
                        title={copiedIndex === i ? "Copied" : "Copy message"}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                          <rect x="9" y="9" width="10" height="10" rx="2" />
                          <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="message-user-actions__icon-btn"
                        onClick={() => {
                          if (!m.content.trim()) return;
                          onRegenerateUserMessage(i, m.content);
                        }}
                        disabled={editDisabled || !m.content.trim()}
                        aria-label="Regenerate response"
                        title="Regenerate response"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                          <path d="M21 12a9 9 0 1 1-2.6-6.4" />
                          <path d="M21 4v6h-6" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              ) : null}
              {showChoiceUi && (
                <div className="message-choices" aria-label="Suggested answers">
                  {choiceQuestions.map((choice, qIndex) => (
                    <div key={`${i}-choice-${qIndex}`} className="message-choices__group">
                      <p className="message-choices__question">{choice.question}</p>
                      <div className="message-choices__list">
                        {choice.options.map((option, optionIndex) => (
                          <button
                            key={`${i}-choice-${qIndex}-option-${optionIndex}`}
                            type="button"
                            className="message-choice-btn"
                            onClick={() => onChooseAnswer(composeSelectedAnswer(choice.question, option))}
                            disabled={choiceDisabled}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </li>
          );
        })()
      ))}
      {showTyping && <TypingIndicator />}
    </ul>
  );
}
