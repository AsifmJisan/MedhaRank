import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { g as getCurrentUser } from "./router-DLih9N2T.js";
import { u as usePracticeData, c as clearWrongQuestions, q as questionKey, r as removeWrongQuestion } from "./practice-DYSfmWB4.js";
import { B as BookmarkButton } from "./BookmarkButton-CdTX_bJr.js";
import { Trash2, AlertTriangle, RotateCw, CheckCircle2, XCircle } from "lucide-react";
import "@tanstack/react-query";
function WrongAnswersPage() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!getCurrentUser()) navigate({
      to: "/login"
    });
  }, [navigate]);
  const {
    wrong
  } = usePracticeData();
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "glass-strong rounded-3xl p-6 sm:p-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-400 text-2xl", children: "⚠️" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold sm:text-3xl", children: "Wrong Answer Practice" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
            wrong.length,
            " saved question",
            wrong.length === 1 ? "" : "s",
            " to review."
          ] })
        ] })
      ] }),
      wrong.length > 0 && /* @__PURE__ */ jsxs("button", { onClick: () => clearWrongQuestions(), className: "inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-200 hover:bg-rose-500/20", children: [
        /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
        " Clear All Wrong Questions"
      ] })
    ] }) }),
    wrong.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl p-10 text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "mx-auto mb-3 h-8 w-8 text-[var(--brand-cyan)]" }),
      "No wrong answers saved yet. Take an exam and your mistakes will show up here.",
      /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(Link, { to: "/subjects", className: "text-[var(--brand-cyan)] hover:underline", children: "Browse subjects →" }) })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: wrong.map((q) => /* @__PURE__ */ jsx(WrongCard, { q }, questionKey(q))) })
  ] });
}
function WrongCard({
  q
}) {
  const key = questionKey(q);
  const [practice, setPractice] = useState(false);
  const [picked, setPicked] = useState(null);
  const gotItRight = picked === q.correct;
  return /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
        q.subjectName,
        " · ",
        q.chapterTitle
      ] }),
      /* @__PURE__ */ jsx(BookmarkButton, { question: {
        subjectSlug: q.subjectSlug,
        subjectName: q.subjectName,
        chapterTitle: q.chapterTitle,
        text: q.text,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation
      } })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "font-medium leading-relaxed", children: q.text }),
    /* @__PURE__ */ jsx("div", { className: "mt-3 grid gap-1.5", children: Object.entries(q.options).map(([k, v]) => {
      const isAnswer = k === q.correct;
      const isOldWrong = k === q.selected;
      const isPicked = practice && picked === k;
      let cls = "border-white/10 bg-white/5";
      if (practice) {
        if (picked) {
          if (isAnswer) cls = "border-emerald-500/50 bg-emerald-500/10";
          else if (isPicked) cls = "border-rose-500/50 bg-rose-500/10";
        } else {
          cls = "border-white/10 bg-white/5 hover:bg-white/10";
        }
      } else {
        if (isAnswer) cls = "border-emerald-500/50 bg-emerald-500/10";
        else if (isOldWrong) cls = "border-rose-500/50 bg-rose-500/10";
      }
      const content = /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("span", { className: "font-semibold uppercase", children: [
          k,
          "."
        ] }),
        /* @__PURE__ */ jsx("span", { className: "flex-1", children: v }),
        !practice && isAnswer && /* @__PURE__ */ jsx("span", { className: "text-xs text-emerald-300", children: "Correct" }),
        !practice && isOldWrong && !isAnswer && /* @__PURE__ */ jsx("span", { className: "text-xs text-rose-300", children: "Your answer" }),
        practice && picked && isAnswer && /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-300" }),
        practice && isPicked && !isAnswer && /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4 text-rose-300" })
      ] });
      return practice && !picked ? /* @__PURE__ */ jsx("button", { onClick: () => setPicked(k), className: `flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm ${cls}`, children: content }, k) : /* @__PURE__ */ jsx("div", { className: `flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${cls}`, children: content }, k);
    }) }),
    practice && picked && /* @__PURE__ */ jsx("div", { className: `mt-3 rounded-lg border px-3 py-2 text-sm ${gotItRight ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : "border-rose-500/40 bg-rose-500/10 text-rose-200"}`, children: gotItRight ? "Correct! You can remove this from your wrong list." : "Not quite — try again or review the explanation below." }),
    q.explanation && /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-xl border border-[var(--brand-cyan)]/30 bg-[var(--brand-cyan)]/10 p-3 text-sm leading-relaxed", children: [
      /* @__PURE__ */ jsx("span", { className: "font-semibold text-[var(--brand-cyan)]", children: "Explanation: " }),
      q.explanation
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [
      !practice ? /* @__PURE__ */ jsxs("button", { onClick: () => {
        setPractice(true);
        setPicked(null);
      }, className: "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm btn-gradient btn-gradient-hover", children: [
        /* @__PURE__ */ jsx(RotateCw, { className: "h-4 w-4" }),
        " Practice Again"
      ] }) : /* @__PURE__ */ jsx("button", { onClick: () => {
        setPractice(false);
        setPicked(null);
      }, className: "glass inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm", children: "Done practicing" }),
      /* @__PURE__ */ jsxs("button", { onClick: () => removeWrongQuestion(key), className: `inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm ${gotItRight ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25" : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"}`, children: [
        /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
        " Remove from Wrong List"
      ] })
    ] })
  ] });
}
export {
  WrongAnswersPage as component
};
