import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { f as Route, g as getCurrentUser, b as saveResult } from "./router-DLih9N2T.js";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { B as BookmarkButton } from "./BookmarkButton-CdTX_bJr.js";
import { s as saveWrongQuestion } from "./practice-DYSfmWB4.js";
import "@tanstack/react-query";
function ExamPage() {
  const {
    subject,
    chapter
  } = Route.useLoaderData();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [startUser] = useState(() => getCurrentUser());
  useEffect(() => {
    if (!startUser) navigate({
      to: "/login"
    });
  }, [startUser, navigate]);
  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1e3);
    return () => clearInterval(t);
  }, [submitted]);
  const total = chapter.questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round(answeredCount / total * 100);
  const q = chapter.questions[current];
  const optionKeys = useMemo(() => q?.options ? Object.keys(q.options) : [], [q]);
  const submit = () => {
    if (!startUser) return;
    const correct = chapter.questions.reduce((acc, qq, i) => acc + (answers[i] === qq.correct ? 1 : 0), 0);
    const wrong = chapter.questions.reduce((acc, qq, i) => acc + (answers[i] && answers[i] !== qq.correct ? 1 : 0), 0);
    const finalScore = Math.max(0, correct - wrong * 0.25);
    const score = total ? Math.round(finalScore / total * 100) : 0;
    const result = {
      id: crypto.randomUUID(),
      userId: startUser.id,
      userName: startUser.name,
      subjectSlug: subject.slug,
      subjectName: subject.name,
      chapterTitle: chapter.title,
      total,
      correct,
      wrong,
      score,
      durationSec: seconds,
      answers: chapter.questions.map((qq, i) => ({
        qIndex: i,
        selected: answers[i] ?? null,
        correct: qq.correct
      })),
      questions: chapter.questions.map((qq) => ({
        text: qq.text,
        options: qq.options,
        correct: qq.correct,
        explanation: qq.explanation
      })),
      createdAt: Date.now()
    };
    saveResult(result);
    chapter.questions.forEach((qq, i) => {
      const sel = answers[i] ?? null;
      if (sel && sel !== qq.correct) {
        saveWrongQuestion({
          subjectSlug: subject.slug,
          subjectName: subject.name,
          chapterTitle: chapter.title,
          text: qq.text,
          options: qq.options,
          correct: qq.correct,
          explanation: qq.explanation,
          selected: sel,
          timestamp: Date.now()
        });
      }
    });
    setSubmitted(true);
    navigate({
      to: "/result"
    });
  };
  if (!startUser) return null;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxs(Link, { to: "/subjects/$subject", params: {
      subject: subject.slug
    }, className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white", children: [
      /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
      " Back to chapters"
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass-strong rounded-3xl p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: subject.name }),
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold sm:text-2xl", children: chapter.title })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-[var(--brand-cyan)]" }),
          " ",
          mm,
          ":",
          ss
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-1 flex justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Question ",
            current + 1,
            " of ",
            total
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            answeredCount,
            "/",
            total,
            " answered · ",
            progress,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "shimmer-bar shimmer-bar-after h-2.5 overflow-hidden rounded-full bg-white/10", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full transition-all duration-500", style: {
          width: `${progress}%`,
          background: "linear-gradient(90deg, var(--brand-cyan), var(--brand-blue), var(--brand-purple))",
          boxShadow: "0 0 18px oklch(0.65 0.22 280 / 60%)"
        } }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-1 text-base font-medium leading-relaxed sm:text-lg", children: q.text }),
        /* @__PURE__ */ jsx(BookmarkButton, { question: {
          subjectSlug: subject.slug,
          subjectName: subject.name,
          chapterTitle: chapter.title,
          text: q.text,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation
        } })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-5 grid gap-2.5", children: optionKeys.map((k) => {
        const selected = answers[current] === k;
        return /* @__PURE__ */ jsxs("button", { onClick: () => setAnswers((a) => ({
          ...a,
          [current]: k
        })), className: `flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${selected ? "border-[var(--brand-cyan)] bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`, children: [
          /* @__PURE__ */ jsx("span", { className: `grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${selected ? "btn-gradient" : "bg-white/10"}`, children: k.toUpperCase() }),
          /* @__PURE__ */ jsx("span", { className: "leading-relaxed", children: q.options[k] })
        ] }, k);
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("button", { onClick: () => setCurrent((c) => Math.max(0, c - 1)), disabled: current === 0, className: "glass inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm disabled:opacity-40", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
        " Previous"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-center gap-1.5", children: chapter.questions.map((_, i) => /* @__PURE__ */ jsx("button", { onClick: () => setCurrent(i), className: `h-8 w-8 rounded-lg text-xs font-medium transition ${i === current ? "btn-gradient" : answers[i] ? "bg-[var(--brand-cyan)]/30 text-white" : "bg-white/5 hover:bg-white/10"}`, children: i + 1 }, i)) }),
      current === total - 1 ? /* @__PURE__ */ jsxs("button", { onClick: submit, className: "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 btn-gradient btn-gradient-hover", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
        " Submit exam"
      ] }) : /* @__PURE__ */ jsxs("button", { onClick: () => setCurrent((c) => Math.min(total - 1, c + 1)), className: "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 btn-gradient btn-gradient-hover", children: [
        "Next ",
        /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
      ] })
    ] })
  ] });
}
export {
  ExamPage as component
};
