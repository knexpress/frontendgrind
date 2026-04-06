const progressKey = (conversationId: string) => `grind_intake_progress_${conversationId}`;

export type IntakeProgress = {
  stepIndex: number;
  answers: Record<string, string>;
};

export function loadIntakeProgress(conversationId: string): IntakeProgress | null {
  try {
    const raw = sessionStorage.getItem(progressKey(conversationId));
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const stepIndex = (data as { stepIndex?: unknown }).stepIndex;
    const answers = (data as { answers?: unknown }).answers;
    if (typeof stepIndex !== "number" || stepIndex < 0) return null;
    if (!answers || typeof answers !== "object") return null;
    return { stepIndex, answers: answers as Record<string, string> };
  } catch {
    return null;
  }
}

export function saveIntakeProgress(
  conversationId: string,
  stepIndex: number,
  answers: Record<string, string>
): void {
  const payload: IntakeProgress = { stepIndex, answers };
  sessionStorage.setItem(progressKey(conversationId), JSON.stringify(payload));
}

export function clearIntakeProgress(conversationId: string): void {
  sessionStorage.removeItem(progressKey(conversationId));
}
