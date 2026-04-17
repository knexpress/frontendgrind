import { useState } from "react";
import type { ConversationMessage } from "../../api/conversations";
import { TypingIndicator } from "./TypingIndicator";

type Props = {
  messages: ConversationMessage[];
  showTyping: boolean;
  sessionLoading: boolean;
  choiceDisabled: boolean;
  onChooseAnswer: (text: string) => void;
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

export function MessageList({
  messages,
  showTyping,
  sessionLoading,
  choiceDisabled,
  onChooseAnswer,
}: Props) {
  const [stepIndexByMessage, setStepIndexByMessage] = useState<Record<string, number>>({});
  const [expandedByMessage, setExpandedByMessage] = useState<Record<string, boolean>>({});
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
              {canShowStepMode && !isExpanded ? (
                <div className="message-stepper" aria-label="Step-by-step response">
                  <p className="message-stepper__text">{planSteps[activeStepIndex]}</p>
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
                <p className="message__text">{m.content}</p>
              )}
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
