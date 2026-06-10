export type AiTutorQuestionContext = {
  text: string;
  options: Record<string, string>;
  correct: string;
  selected?: string;
  explanation?: string;
  subjectName?: string;
  chapterTitle?: string;
};

const KEY = "medharank.aiTutor.context";

export function setAiTutorContext(ctx: AiTutorQuestionContext) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(ctx));
  } catch {
    // ignore storage errors
  }
}

export function takeAiTutorContext(): AiTutorQuestionContext | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    return JSON.parse(raw) as AiTutorQuestionContext;
  } catch {
    return null;
  }
}

export function buildTutorPrompt(ctx: AiTutorQuestionContext): string {
  const optionLines = Object.entries(ctx.options)
    .map(([k, v]) => `${k}. ${v}`)
    .join("\n");
  const parts = [
    "Explain this MCQ in an easy exam-focused way. Include why the correct answer is correct and why the other options are wrong. Explain in Bangla if the question is Bangla.",
    "",
    ctx.subjectName ? `Subject: ${ctx.subjectName}` : "",
    ctx.chapterTitle ? `Chapter: ${ctx.chapterTitle}` : "",
    "",
    `Question: ${ctx.text}`,
    "Options:",
    optionLines,
    `Correct answer: ${ctx.correct}`,
    ctx.selected ? `Student's selected answer: ${ctx.selected}` : "Student did not answer.",
    ctx.explanation ? `Existing explanation: ${ctx.explanation}` : "",
  ];
  return parts.filter((l) => l !== "").join("\n");
}
