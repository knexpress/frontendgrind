/**
 * All frontend-owned copy that is sent to the LLM (user role).
 * System / persona prompts live in the backend: backend/src/prompts/
 */
export {
  INTAKE_LLM_INTRO,
  INTAKE_LLM_QUESTION_LABEL,
  INTAKE_LLM_ANSWER_LABEL,
  INTAKE_LLM_CLOSING,
  buildIntakePromptForLlm,
} from "./llmUserPrompts";
