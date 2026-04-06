import { useCallback, useEffect, useRef, useState } from "react";
import { buildIntakePromptForLlm } from "../../prompts/llmUserPrompts";
import { INTAKE_STEPS, type IntakeStep } from "./intakeSteps";
import {
  clearIntakeProgress,
  loadIntakeProgress,
  saveIntakeProgress,
} from "./intakeStorage";
import "./intake.css";

type Props = {
  conversationId: string;
  onSubmit: (message: string) => Promise<void>;
  onDismiss: () => void;
};

export function IntakeQuestionnaire({ conversationId, onSubmit, onDismiss }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customDraft, setCustomDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [progressHydrated, setProgressHydrated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const total = INTAKE_STEPS.length;
  const step: IntakeStep = INTAKE_STEPS[stepIndex]!;
  const currentAnswer = answers[step.id] ?? "";

  useEffect(() => {
    setProgressHydrated(false);
    const saved = loadIntakeProgress(conversationId);
    if (saved) {
      const maxStep = Math.min(saved.stepIndex, total - 1);
      setStepIndex(maxStep);
      setAnswers(saved.answers);
    } else {
      setStepIndex(0);
      setAnswers({});
    }
    setProgressHydrated(true);
  }, [conversationId, total]);

  useEffect(() => {
    if (!progressHydrated) return;
    saveIntakeProgress(conversationId, stepIndex, answers);
  }, [conversationId, stepIndex, answers, progressHydrated]);

  const finishWithAnswers = useCallback(
    async (finalAnswers: Record<string, string>) => {
      const complete = INTAKE_STEPS.every((s) => (finalAnswers[s.id] ?? "").trim().length > 0);
      if (!complete) return;
      const text = buildIntakePromptForLlm(finalAnswers);
      setSubmitting(true);
      try {
        await onSubmit(text);
        sessionStorage.setItem(`grind_intake_done_${conversationId}`, "1");
        clearIntakeProgress(conversationId);
      } finally {
        setSubmitting(false);
      }
    },
    [conversationId, onSubmit]
  );

  useEffect(() => {
    setCustomDraft("");
    inputRef.current?.focus();
  }, [stepIndex, conversationId]);

  const goPrev = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setStepIndex((i) => Math.min(total - 1, i + 1));
  }, [total]);

  const pickOption = useCallback(
    (value: string) => {
      setAnswers((prev) => {
        const next = { ...prev, [step.id]: value };
        queueMicrotask(() => {
          if (stepIndex < total - 1) {
            setStepIndex((i) => i + 1);
          } else {
            void finishWithAnswers(next);
          }
        });
        return next;
      });
    },
    [finishWithAnswers, step.id, stepIndex, total]
  );

  const submitCustom = useCallback(() => {
    const t = customDraft.trim();
    if (!t) return;
    setAnswers((prev) => {
      const next = { ...prev, [step.id]: t };
      queueMicrotask(() => {
        if (stepIndex < total - 1) {
          setStepIndex((i) => i + 1);
        } else {
          void finishWithAnswers(next);
        }
      });
      return next;
    });
    setCustomDraft("");
  }, [customDraft, finishWithAnswers, step.id, stepIndex, total]);

  const handleClose = useCallback(() => {
    sessionStorage.setItem(`grind_intake_skipped_${conversationId}`, "1");
    clearIntakeProgress(conversationId);
    onDismiss();
  }, [conversationId, onDismiss]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  const canGoNext =
    stepIndex < total - 1 && (currentAnswer.trim().length > 0 || customDraft.trim().length > 0);

  const handleHeaderNext = () => {
    if (stepIndex >= total - 1) return;
    if (currentAnswer.trim()) goNext();
    else if (customDraft.trim()) submitCustom();
  };

  return (
    <div className="intake-overlay" role="presentation">
      <button type="button" className="intake-backdrop" aria-label="Dismiss questionnaire" onClick={handleClose} />
      <div
        className="intake-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="intake-question-title"
      >
        <header className="intake-sheet__header">
          <div className="intake-sheet__nav">
            <button
              type="button"
              className="intake-sheet__nav-btn"
              onClick={goPrev}
              disabled={stepIndex === 0 || submitting}
              aria-label="Previous question"
            >
              ‹
            </button>
            <span className="intake-sheet__step">
              {stepIndex + 1} of {total}
            </span>
            <button
              type="button"
              className="intake-sheet__nav-btn"
              onClick={handleHeaderNext}
              disabled={!canGoNext || submitting}
              aria-label="Next question"
            >
              ›
            </button>
          </div>
          <button
            type="button"
            className="intake-sheet__close"
            onClick={handleClose}
            disabled={submitting}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <h2 id="intake-question-title" className="intake-sheet__question">
          {step.question}
        </h2>

        <ol className="intake-options" aria-label="Choices">
          {step.options.map((opt, i) => (
            <li key={opt.value}>
              <button
                type="button"
                className={`intake-option${currentAnswer === opt.value ? " intake-option--selected" : ""}`}
                onClick={() => pickOption(opt.value)}
                disabled={submitting}
              >
                <span className="intake-option__num">{i + 1}</span>
                <span className="intake-option__label">{opt.label}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="intake-custom">
          <span className="intake-custom__icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            className="intake-custom__input"
            placeholder="Type your answer…"
            value={customDraft}
            onChange={(e) => setCustomDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitCustom();
              }
            }}
            disabled={submitting}
            aria-label="Custom answer"
          />
        </div>
      </div>
    </div>
  );
}
