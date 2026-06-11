import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { a as getLastResult, s as slugifyChapter } from "./router-DLih9N2T.js";
import { Trophy, HelpCircle, CheckCircle2, XCircle, MinusCircle, RotateCw, Sparkles } from "lucide-react";
import { B as BookmarkButton } from "./BookmarkButton-CdTX_bJr.js";
import { s as setAiTutorContext } from "./aiTutorContext-hrvjCl4-.js";
import "@tanstack/react-query";
import "./practice-DYSfmWB4.js";
function ResultPage() {
  const navigate = useNavigate();
  const [r, setR] = useState(null);
  useEffect(() => {
    const last = getLastResult();
    if (!last) navigate({
      to: "/dashboard"
    });
    else setR(last);
  }, [navigate]);
  if (!r) return null;
  String(Math.floor(r.durationSec / 60)).padStart(2, "0");
  String(r.durationSec % 60).padStart(2, "0");
  const wrong = r.wrong ?? r.total - r.correct;
  const unanswered = r.total - r.correct - wrong;
  const negativeMark = wrong * 0.25;
  const finalScore = Math.max(0, r.correct - negativeMark);
  const grade = r.score >= 80 ? "Excellent" : r.score >= 60 ? "Good" : r.score >= 40 ? "Keep going" : "Needs practice";
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "glass-strong rounded-3xl p-8 text-center", children: [
      /* @__PURE__ */ jsx(Trophy, { className: "mx-auto h-10 w-10 text-[var(--brand-cyan)] glow-pulse" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
        r.subjectName,
        " · ",
        r.chapterTitle
      ] }),
      /* @__PURE__ */ jsx(CircularScore, { score: r.score }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-medium", children: grade }),
      /* @__PURE__ */ jsxs("div", { className: "mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsx(Stat, { label: "Total Questions", value: r.total, icon: /* @__PURE__ */ jsx(HelpCircle, { className: "h-4 w-4 text-[var(--brand-cyan)]" }) }),
        /* @__PURE__ */ jsx(Stat, { label: "Correct Answers", value: r.correct, icon: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-400" }) }),
        /* @__PURE__ */ jsx(Stat, { label: "Wrong Answers", value: wrong, icon: /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4 text-rose-400" }) }),
        /* @__PURE__ */ jsx(Stat, { label: "Unanswered", value: unanswered, icon: /* @__PURE__ */ jsx(MinusCircle, { className: "h-4 w-4 text-amber-400" }) }),
        /* @__PURE__ */ jsx(Stat, { label: "Negative Mark", value: `-${negativeMark.toFixed(2)}`, icon: /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4 text-rose-400" }) }),
        /* @__PURE__ */ jsx(Stat, { label: "Final Score", value: `${finalScore.toFixed(2)} / ${r.total}`, icon: /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4 text-[var(--brand-cyan)]" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-3", children: [
        /* @__PURE__ */ jsxs(Link, { to: "/exam/$subject/$chapter", params: {
          subject: r.subjectSlug,
          chapter: slugifyChapter(r.chapterTitle)
        }, className: "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 btn-gradient btn-gradient-hover", children: [
          /* @__PURE__ */ jsx(RotateCw, { className: "h-4 w-4" }),
          " Retake exam"
        ] }),
        /* @__PURE__ */ jsx(Link, { to: "/dashboard", className: "glass inline-flex items-center gap-2 rounded-xl px-5 py-2.5", children: "Dashboard" }),
        /* @__PURE__ */ jsx(Link, { to: "/leaderboard", className: "glass inline-flex items-center gap-2 rounded-xl px-5 py-2.5", children: "Leaderboard" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-4 text-2xl font-bold", children: "Review your answers" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: r.questions.map((q, i) => {
        const sel = r.answers[i]?.selected;
        const isCorrect = sel === q.correct;
        return /* @__PURE__ */ jsx("div", { className: "glass rounded-2xl p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: `mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${isCorrect ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`, children: i + 1 }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "flex-1 font-medium leading-relaxed", children: q.text }),
              /* @__PURE__ */ jsx(BookmarkButton, { question: {
                subjectSlug: r.subjectSlug,
                subjectName: r.subjectName,
                chapterTitle: r.chapterTitle,
                text: q.text,
                options: q.options,
                correct: q.correct,
                explanation: q.explanation
              } })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3 grid gap-1.5", children: [
              Object.entries(q.options).map(([k, v]) => {
                const isAnswer = k === q.correct;
                const isSelected = k === sel;
                let cls = "border-white/10 bg-white/5";
                if (isAnswer) cls = "border-emerald-500/50 bg-emerald-500/10";
                else if (isSelected) cls = "border-rose-500/50 bg-rose-500/10";
                return /* @__PURE__ */ jsxs("div", { className: `flex items-start gap-3 rounded-lg border px-3 py-2 text-sm ${cls}`, children: [
                  /* @__PURE__ */ jsxs("span", { className: "font-semibold uppercase", children: [
                    k,
                    "."
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "flex-1", children: v }),
                  isAnswer && /* @__PURE__ */ jsx("span", { className: "text-xs text-emerald-300", children: "Correct" }),
                  isSelected && !isAnswer && /* @__PURE__ */ jsx("span", { className: "text-xs text-rose-300", children: "Your answer" })
                ] }, k);
              }),
              !sel && /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "You did not answer this question." })
            ] }),
            q.explanation && /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-xl border border-[var(--brand-cyan)]/30 bg-[var(--brand-cyan)]/10 p-3 text-sm leading-relaxed", children: [
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-[var(--brand-cyan)]", children: "Explanation: " }),
              q.explanation
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
              setAiTutorContext({
                text: q.text,
                options: q.options,
                correct: q.correct,
                selected: sel ?? void 0,
                explanation: q.explanation,
                subjectName: r.subjectName,
                chapterTitle: r.chapterTitle
              });
              navigate({
                to: "/ai-teacher"
              });
            }, className: "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium btn-gradient btn-gradient-hover shadow-md shadow-purple-500/20", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }),
              "Ask AI Tutor"
            ] }) })
          ] })
        ] }) }, i);
      }) })
    ] })
  ] });
}
function Stat({
  label,
  value,
  icon
}) {
  return /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl p-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-1.5 text-xs text-muted-foreground", children: [
      icon,
      label
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-1 text-xl font-bold", children: value })
  ] });
}
function CircularScore({
  score
}) {
  const size = 180;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - score / 100 * c;
  const color = score >= 80 ? "#34d399" : score >= 60 ? "#60a5fa" : score >= 40 ? "#fbbf24" : "#fb7185";
  return /* @__PURE__ */ jsxs("div", { className: "relative mx-auto mt-4 grid place-items-center", style: {
    width: size,
    height: size
  }, children: [
    /* @__PURE__ */ jsxs("svg", { width: size, height: size, className: "-rotate-90", children: [
      /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "cs-grad", x1: "0", y1: "0", x2: "1", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "oklch(0.80 0.16 200)" }),
        /* @__PURE__ */ jsx("stop", { offset: "50%", stopColor: "oklch(0.65 0.22 255)" }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "oklch(0.65 0.25 300)" })
      ] }) }),
      /* @__PURE__ */ jsx("circle", { cx: size / 2, cy: size / 2, r, stroke: "oklch(1 0 0 / 10%)", strokeWidth: stroke, fill: "none" }),
      /* @__PURE__ */ jsx("circle", { cx: size / 2, cy: size / 2, r, stroke: "url(#cs-grad)", strokeWidth: stroke, strokeLinecap: "round", fill: "none", strokeDasharray: c, strokeDashoffset: offset, style: {
        transition: "stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)",
        filter: `drop-shadow(0 0 12px ${color}99)`
      } })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 grid place-items-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-5xl font-bold gradient-text leading-none", children: [
        score,
        "%"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-1 text-[10px] uppercase tracking-widest text-muted-foreground", children: "Score" })
    ] }) })
  ] });
}
export {
  ResultPage as component
};
