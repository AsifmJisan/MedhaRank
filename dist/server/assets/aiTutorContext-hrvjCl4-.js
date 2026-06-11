const KEY = "medharank.aiTutor.context";
function setAiTutorContext(ctx) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(ctx));
  } catch {
  }
}
function takeAiTutorContext() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function buildTutorPrompt(ctx) {
  const optionLines = Object.entries(ctx.options).map(([k, v]) => `${k}. ${v}`).join("\n");
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
    ctx.explanation ? `Existing explanation: ${ctx.explanation}` : ""
  ];
  return parts.filter((l) => l !== "").join("\n");
}
export {
  buildTutorPrompt as b,
  setAiTutorContext as s,
  takeAiTutorContext as t
};
