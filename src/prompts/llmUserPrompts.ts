/**
 * User-side text that is sent TO the model (as a user message).
 * Edit the strings below to change how intake results are framed for GRIND.
 */
import { INTAKE_STEPS } from "../features/chat/intakeSteps";

/** Opening paragraph of the first message after intake completes */
export const INTAKE_LLM_INTRO =
  "I went through your intake one question at a time. Below is each question with the answer I saved for it. Use all of this as context for our chat.";

/** Label before each intake question in the assembled prompt */
export const INTAKE_LLM_QUESTION_LABEL = "Question:";

/** Label before each intake answer in the assembled prompt */
export const INTAKE_LLM_ANSWER_LABEL = "My answer:";

/** Closing instruction after all Q&A pairs */
export const INTAKE_LLM_CLOSING =
  "Use this intake as sufficient starting context. Do not ask follow-up questions by default. Give me a concrete, prioritized action plan now. If details are missing, state your assumptions briefly and continue with recommendations.";

/**
 * Builds the single user message sent to the API after all intake steps are answered.
 */
export function buildIntakePromptForLlm(answers: Record<string, string>): string {
  const pairs = INTAKE_STEPS.map((s) => {
    const a = (answers[s.id] ?? "").trim();
    return `${INTAKE_LLM_QUESTION_LABEL} ${s.question}\n${INTAKE_LLM_ANSWER_LABEL} ${a}`;
  });

  return [INTAKE_LLM_INTRO, "", ...pairs, "", INTAKE_LLM_CLOSING].join("\n\n");
}
