import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { S as SUBJECTS } from "./router-DLih9N2T.js";
import { Sparkles, ArrowRight, BookOpen, Target, Zap, Trophy } from "lucide-react";
import "@tanstack/react-query";
import "react";
function Home() {
  const totalQuestions = SUBJECTS.reduce((a, s) => a + s.chapters.reduce((b, c) => b + c.questions.length, 0), 0);
  const totalChapters = SUBJECTS.reduce((a, s) => a + s.chapters.length, 0);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-20", children: [
    /* @__PURE__ */ jsx("section", { className: "relative pt-8", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl text-center", children: [
      /* @__PURE__ */ jsxs("span", { className: "glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5 text-[var(--brand-cyan)]" }),
        "Trusted by future doctors, engineers & scholars"
      ] }),
      /* @__PURE__ */ jsxs("h1", { className: "mt-6 text-4xl font-bold leading-tight sm:text-6xl", children: [
        "Master every exam with",
        " ",
        /* @__PURE__ */ jsx("span", { className: "gradient-text", children: "MedhaRank" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-5 text-base text-muted-foreground sm:text-lg", children: "A premium MCQ practice platform for Physics, Chemistry, Math, Medical and University admission — with detailed Bangla explanations, live exams and a national leaderboard." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap justify-center gap-3", children: [
        /* @__PURE__ */ jsxs(Link, { to: "/register", className: "inline-flex items-center gap-2 rounded-xl px-6 py-3 btn-gradient btn-gradient-hover", children: [
          "Start practicing free ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
        ] }),
        /* @__PURE__ */ jsx(Link, { to: "/subjects", className: "glass inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium hover:bg-white/10", children: "Browse subjects" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3", children: [{
        v: SUBJECTS.length,
        l: "Subjects"
      }, {
        v: totalChapters,
        l: "Chapters"
      }, {
        v: `${totalQuestions}+`,
        l: "MCQs"
      }].map((s) => /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl p-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold gradient-text", children: s.v }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: s.l })
      ] }, s.l)) })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-8 text-center text-3xl font-bold", children: "Everything you need to top the merit list" }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-5 md:grid-cols-3", children: [{
        i: BookOpen,
        t: "Chapter-wise MCQs",
        d: "Practice from a curated bank of admission-quality questions, organized chapter by chapter."
      }, {
        i: Target,
        t: "Detailed explanations",
        d: "Every question comes with a step-by-step Bangla explanation — learn the why, not just the answer."
      }, {
        i: Zap,
        t: "Live & daily exams",
        d: "Compete in scheduled live exams and daily challenges to keep your prep sharp."
      }, {
        i: Trophy,
        t: "National leaderboard",
        d: "See where you rank against thousands of students. Earn rank badges as you climb."
      }, {
        i: Sparkles,
        t: "Study notes library",
        d: "Concise, exam-focused notes for every chapter — perfect for quick revision."
      }, {
        i: ArrowRight,
        t: "Smart progress",
        d: "Track your accuracy, time and streaks. Know exactly what to revise next."
      }].map(({
        i: Icon,
        t,
        d
      }) => /* @__PURE__ */ jsxs("div", { className: "glass-glow glass-glow-hover rounded-2xl p-6", children: [
        /* @__PURE__ */ jsx("div", { className: "grid h-10 w-10 place-items-center rounded-xl btn-gradient", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-semibold", children: t }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: d })
      ] }, t)) })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-end justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold", children: "Subjects" }),
        /* @__PURE__ */ jsx(Link, { to: "/subjects", className: "text-sm text-[var(--brand-cyan)] hover:underline", children: "View all →" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: SUBJECTS.map((s) => /* @__PURE__ */ jsxs(Link, { to: "/subjects/$subject", params: {
        subject: s.slug
      }, className: "glass-glow glass-glow-hover group rounded-2xl p-6", children: [
        /* @__PURE__ */ jsx("div", { className: `mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${s.gradient} text-2xl`, children: s.icon }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: s.nameBn }),
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold", children: s.name }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
          s.chapters.length,
          " chapters · ",
          s.chapters.reduce((a, c) => a + c.questions.length, 0),
          " questions"
        ] })
      ] }, s.slug)) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "glass-strong rounded-3xl p-10 text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold", children: "Ready to top the merit list?" }),
      /* @__PURE__ */ jsx("p", { className: "mx-auto mt-2 max-w-xl text-muted-foreground", children: "Create a free account and start your first exam in under a minute." }),
      /* @__PURE__ */ jsxs(Link, { to: "/register", className: "mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 btn-gradient btn-gradient-hover", children: [
        "Join MedhaRank ",
        /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
      ] })
    ] })
  ] });
}
export {
  Home as component
};
