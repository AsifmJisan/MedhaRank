import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useEffect, useState, useRef } from "react";
import { g as getCurrentUser, S as SUBJECTS, b as saveResult } from "./router-DLih9N2T.js";
import { Shuffle, CheckCircle2, Sparkles, Clock, ArrowLeft, ArrowRight, Trophy, HelpCircle, XCircle, MinusCircle, RotateCw } from "lucide-react";
import { s as saveWrongQuestion } from "./practice-DYSfmWB4.js";
import { B as BookmarkButton } from "./BookmarkButton-CdTX_bJr.js";
import { s as setAiTutorContext } from "./aiTutorContext-hrvjCl4-.js";
import "@tanstack/react-query";
const QUESTION_PRESETS = [10, 20, 30, 50, 100];
const TIME_PRESETS = [10, 20, 30, 60];
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function RandomExamPage() {
  const navigate = useNavigate();
  const user = useMemo(() => typeof window !== "undefined" ? getCurrentUser() : null, []);
  useEffect(() => {
    if (typeof window !== "undefined" && !getCurrentUser()) navigate({
      to: "/login"
    });
  }, [navigate]);
  const [phase, setPhase] = useState("setup");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const submittedRef = useRef(false);
  if (!user) return null;
  if (phase === "setup") {
    return /* @__PURE__ */ jsx(SetupView, { onStart: (picked, minutes) => {
      setQuestions(picked);
      setAnswers({});
      setCurrent(0);
      const total = minutes * 60;
      setTotalSeconds(total);
      setSecondsLeft(total);
      submittedRef.current = false;
      setPhase("exam");
    } });
  }
  if (phase === "exam") {
    const handleSubmit = (timeUsed) => {
      if (user) {
        const total = questions.length;
        const correct = questions.reduce((a, q, i) => a + (answers[i] === q.correct ? 1 : 0), 0);
        const wrong = questions.reduce((a, q, i) => a + (answers[i] && answers[i] !== q.correct ? 1 : 0), 0);
        const finalScore = Math.max(0, correct - wrong * 0.25);
        const score = total ? Math.round(finalScore / total * 100) : 0;
        const result = {
          id: crypto.randomUUID(),
          userId: user.id,
          userName: user.name,
          subjectSlug: "random",
          subjectName: "Random Exam",
          chapterTitle: "Mixed Chapters",
          total,
          correct,
          wrong,
          score,
          durationSec: timeUsed,
          answers: questions.map((q, i) => ({
            qIndex: i,
            selected: answers[i] ?? null,
            correct: q.correct
          })),
          questions: questions.map((q) => ({
            text: q.text,
            options: q.options,
            correct: q.correct,
            explanation: q.explanation
          })),
          createdAt: Date.now()
        };
        saveResult(result);
        questions.forEach((q, i) => {
          const sel = answers[i] ?? null;
          if (sel && sel !== q.correct) {
            saveWrongQuestion({
              subjectSlug: q.subjectSlug,
              subjectName: q.subjectName,
              chapterTitle: q.chapterTitle,
              text: q.text,
              options: q.options,
              correct: q.correct,
              explanation: q.explanation,
              selected: sel,
              timestamp: Date.now()
            });
          }
        });
      }
      setPhase("result");
    };
    return /* @__PURE__ */ jsx(ExamView, { questions, answers, setAnswers, current, setCurrent, secondsLeft, setSecondsLeft, totalSeconds, submittedRef, onSubmit: handleSubmit });
  }
  return /* @__PURE__ */ jsx(ResultView, { questions, answers, timeUsed: totalSeconds - secondsLeft, onRestart: () => setPhase("setup") });
}
function SetupView({
  onStart
}) {
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [selectedChapters, setSelectedChapters] = useState({});
  const [count, setCount] = useState(20);
  const [minutes, setMinutes] = useState(20);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const activeSubjects = SUBJECTS.filter((s) => selectedSubjects[s.slug]);
  const allSubjectsOn = SUBJECTS.every((s) => selectedSubjects[s.slug]);
  const toggleAllSubjects = () => {
    if (allSubjectsOn) {
      setSelectedSubjects({});
      setSelectedChapters({});
    } else {
      const next = {};
      SUBJECTS.forEach((s) => next[s.slug] = true);
      setSelectedSubjects(next);
    }
  };
  const toggleSubject = (slug) => {
    setSelectedSubjects((p) => {
      const on = !p[slug];
      const next = {
        ...p,
        [slug]: on
      };
      if (!on) {
        setSelectedChapters((cp) => {
          const out = {};
          Object.keys(cp).forEach((k) => {
            if (!k.startsWith(`${slug}::`)) out[k] = cp[k];
          });
          return out;
        });
      }
      return next;
    });
  };
  const toggleChapter = (slug, title) => {
    const key = `${slug}::${title}`;
    setSelectedChapters((p) => ({
      ...p,
      [key]: !p[key]
    }));
  };
  const toggleAllChaptersFor = (slug) => {
    const subj = SUBJECTS.find((s) => s.slug === slug);
    if (!subj) return;
    const allOn = subj.chapters.every((c) => selectedChapters[`${slug}::${c.title}`]);
    setSelectedChapters((p) => {
      const next = {
        ...p
      };
      subj.chapters.forEach((c) => {
        next[`${slug}::${c.title}`] = !allOn;
      });
      return next;
    });
  };
  const pool = useMemo(() => {
    const out = [];
    activeSubjects.forEach((s) => {
      const chaptersOn = s.chapters.filter((c) => selectedChapters[`${s.slug}::${c.title}`]);
      const effective = chaptersOn.length ? chaptersOn : s.chapters;
      effective.forEach((c) => {
        c.questions.forEach((q) => {
          out.push({
            ...q,
            subjectName: s.name,
            subjectSlug: s.slug,
            chapterTitle: c.title
          });
        });
      });
    });
    return out;
  }, [selectedSubjects, selectedChapters]);
  const start = () => {
    setError(null);
    setInfo(null);
    if (activeSubjects.length === 0) {
      setError("Select at least one subject.");
      return;
    }
    if (!count || count < 1) {
      setError("Set a valid question count.");
      return;
    }
    if (!minutes || minutes < 1) {
      setError("Set a valid exam time.");
      return;
    }
    if (pool.length === 0) {
      setError("No questions are available from your selection.");
      return;
    }
    const take = Math.min(count, pool.length);
    const picked = shuffle(pool).slice(0, take);
    if (take < count) setInfo(`Only ${pool.length} questions are available from your selected chapters.`);
    onStart(picked, minutes);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "glass-strong rounded-3xl p-6 sm:p-8", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "grid h-12 w-12 place-items-center rounded-2xl btn-gradient", children: /* @__PURE__ */ jsx(Shuffle, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold sm:text-3xl", children: "Random Exam" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Build a custom mock from any subjects and chapters." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "glass rounded-2xl p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-3 flex flex-wrap items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "1. Choose subjects" }),
        /* @__PURE__ */ jsx("button", { onClick: toggleAllSubjects, className: "rounded-lg px-3 py-1.5 text-xs glass hover:bg-white/10", children: allSubjectsOn ? "Clear all" : "Select all subjects" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: SUBJECTS.map((s) => {
        const on = !!selectedSubjects[s.slug];
        const totalQ = s.chapters.reduce((a, c) => a + c.questions.length, 0);
        return /* @__PURE__ */ jsx("button", { onClick: () => toggleSubject(s.slug), className: `text-left rounded-2xl p-4 transition border ${on ? "border-[var(--brand-cyan)] bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: `grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${s.gradient} text-xl`, children: s.icon }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("div", { className: "truncate font-semibold", children: s.name }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
              s.chapters.length,
              " chapters · ",
              totalQ,
              " Qs"
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: `grid h-5 w-5 place-items-center rounded-md border ${on ? "border-[var(--brand-cyan)] bg-[var(--brand-cyan)]/30" : "border-white/20"}`, children: on && /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-[var(--brand-cyan)]" }) })
        ] }) }, s.slug);
      }) })
    ] }),
    activeSubjects.length > 0 && /* @__PURE__ */ jsxs("section", { className: "glass rounded-2xl p-5", children: [
      /* @__PURE__ */ jsxs("h2", { className: "mb-3 text-lg font-semibold", children: [
        "2. Choose chapters ",
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "(leave empty for all chapters of a subject)" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-5", children: activeSubjects.map((s) => {
        const allOn = s.chapters.every((c) => selectedChapters[`${s.slug}::${c.title}`]);
        return /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-2 flex flex-wrap items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-sm font-semibold", children: [
              s.icon,
              " ",
              s.name
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: () => toggleAllChaptersFor(s.slug), className: "rounded-lg px-2.5 py-1 text-xs glass hover:bg-white/10", children: allOn ? "Clear" : "Select all" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3", children: s.chapters.map((c) => {
            const key = `${s.slug}::${c.title}`;
            const on = !!selectedChapters[key];
            return /* @__PURE__ */ jsxs("button", { onClick: () => toggleChapter(s.slug, c.title), className: `flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${on ? "border-[var(--brand-cyan)] bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`, children: [
              /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate", children: c.title }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: c.questions.length })
            ] }, key);
          }) })
        ] }, s.slug);
      }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "grid gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-3 text-lg font-semibold", children: "3. Number of questions" }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: QUESTION_PRESETS.map((n) => /* @__PURE__ */ jsx("button", { onClick: () => setCount(n), className: `rounded-xl px-4 py-2 text-sm transition ${count === n ? "btn-gradient" : "glass hover:bg-white/10"}`, children: n }, n)) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground", children: "Custom" }),
          /* @__PURE__ */ jsx("input", { type: "number", min: 1, max: 500, value: count, onChange: (e) => setCount(Math.max(1, Number(e.target.value) || 0)), className: "mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--brand-cyan)]" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-3 text-lg font-semibold", children: "4. Exam time (minutes)" }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: TIME_PRESETS.map((n) => /* @__PURE__ */ jsxs("button", { onClick: () => setMinutes(n), className: `rounded-xl px-4 py-2 text-sm transition ${minutes === n ? "btn-gradient" : "glass hover:bg-white/10"}`, children: [
          n,
          " min"
        ] }, n)) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground", children: "Custom (minutes)" }),
          /* @__PURE__ */ jsx("input", { type: "number", min: 1, max: 300, value: minutes, onChange: (e) => setMinutes(Math.max(1, Number(e.target.value) || 0)), className: "mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--brand-cyan)]" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "mr-1 inline h-4 w-4 text-[var(--brand-cyan)]" }),
          "Pool available: ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-white", children: pool.length }),
          " questions · You'll get ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-white", children: Math.min(count, pool.length) || 0 })
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: start, className: "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 btn-gradient btn-gradient-hover", children: [
          /* @__PURE__ */ jsx(Shuffle, { className: "h-4 w-4" }),
          " Start Random Exam"
        ] })
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200", children: error }),
      info && /* @__PURE__ */ jsx("div", { className: "mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200", children: info })
    ] })
  ] });
}
function ExamView({
  questions,
  answers,
  setAnswers,
  current,
  setCurrent,
  secondsLeft,
  setSecondsLeft,
  totalSeconds,
  submittedRef,
  onSubmit
}) {
  useEffect(() => {
    if (submittedRef.current) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          if (!submittedRef.current) {
            submittedRef.current = true;
            onSubmit(totalSeconds);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1e3);
    return () => clearInterval(t);
  }, []);
  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round(answeredCount / total * 100);
  const q = questions[current];
  const optionKeys = Object.keys(q.options);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const timePct = totalSeconds ? Math.max(0, Math.min(100, secondsLeft / totalSeconds * 100)) : 0;
  const lowTime = secondsLeft <= 30;
  const handleSubmit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    onSubmit(totalSeconds - secondsLeft);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "glass-strong rounded-3xl p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Random Exam" }),
          /* @__PURE__ */ jsxs("h1", { className: "text-xl font-bold sm:text-2xl", children: [
            q.subjectName,
            " · ",
            q.chapterTitle
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ${lowTime ? "text-rose-300" : ""}`, children: [
          /* @__PURE__ */ jsx(Clock, { className: `h-4 w-4 ${lowTime ? "text-rose-400" : "text-[var(--brand-cyan)]"}` }),
          " ",
          mm,
          ":",
          ss
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
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
        /* @__PURE__ */ jsx("div", { className: "h-2.5 overflow-hidden rounded-full bg-white/10", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full transition-all duration-500", style: {
          width: `${progress}%`,
          background: "linear-gradient(90deg, var(--brand-cyan), var(--brand-blue), var(--brand-purple))",
          boxShadow: "0 0 18px oklch(0.65 0.22 280 / 60%)"
        } }) }),
        /* @__PURE__ */ jsx("div", { className: "h-1.5 overflow-hidden rounded-full bg-white/5", children: /* @__PURE__ */ jsx("div", { className: `h-full rounded-full transition-all duration-500 ${lowTime ? "bg-rose-500" : "bg-[var(--brand-cyan)]"}`, style: {
          width: `${timePct}%`
        } }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-2 text-xs text-muted-foreground", children: [
        q.subjectName,
        " · ",
        q.chapterTitle
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-1 text-base font-medium leading-relaxed sm:text-lg", children: q.text }),
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
      /* @__PURE__ */ jsx("div", { className: "flex max-w-full flex-wrap justify-center gap-1.5", children: questions.map((_, i) => /* @__PURE__ */ jsx("button", { onClick: () => setCurrent(i), className: `h-8 w-8 rounded-lg text-xs font-medium transition ${i === current ? "btn-gradient" : answers[i] ? "bg-[var(--brand-cyan)]/30 text-white" : "bg-white/5 hover:bg-white/10"}`, children: i + 1 }, i)) }),
      current === total - 1 ? /* @__PURE__ */ jsxs("button", { onClick: handleSubmit, className: "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 btn-gradient btn-gradient-hover", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
        " Submit exam"
      ] }) : /* @__PURE__ */ jsxs("button", { onClick: () => setCurrent((c) => Math.min(total - 1, c + 1)), className: "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 btn-gradient btn-gradient-hover", children: [
        "Next ",
        /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx("button", { onClick: handleSubmit, className: "text-xs text-muted-foreground hover:text-white underline", children: "Submit early" }) })
  ] });
}
function ResultView({
  questions,
  answers,
  timeUsed,
  onRestart
}) {
  const navigate = useNavigate();
  const total = questions.length;
  const correct = questions.reduce((a, q, i) => a + (answers[i] === q.correct ? 1 : 0), 0);
  const wrong = questions.reduce((a, q, i) => a + (answers[i] && answers[i] !== q.correct ? 1 : 0), 0);
  const unanswered = total - correct - wrong;
  const negativeMark = wrong * 0.25;
  const finalScore = Math.max(0, correct - negativeMark);
  const score = total ? Math.round(finalScore / total * 100) : 0;
  String(Math.floor(timeUsed / 60)).padStart(2, "0");
  String(timeUsed % 60).padStart(2, "0");
  const grade = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Keep going" : "Needs practice";
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "glass-strong rounded-3xl p-8 text-center", children: [
      /* @__PURE__ */ jsx(Trophy, { className: "mx-auto h-10 w-10 text-[var(--brand-cyan)] glow-pulse" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
        "Random Exam · ",
        total,
        " questions"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 text-6xl font-bold gradient-text", children: [
        score,
        "%"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-lg font-medium", children: grade }),
      /* @__PURE__ */ jsxs("div", { className: "mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsx(MiniStat, { label: "Total Questions", value: total, icon: /* @__PURE__ */ jsx(HelpCircle, { className: "h-4 w-4 text-[var(--brand-cyan)]" }) }),
        /* @__PURE__ */ jsx(MiniStat, { label: "Correct Answers", value: correct, icon: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-400" }) }),
        /* @__PURE__ */ jsx(MiniStat, { label: "Wrong Answers", value: wrong, icon: /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4 text-rose-400" }) }),
        /* @__PURE__ */ jsx(MiniStat, { label: "Unanswered", value: unanswered, icon: /* @__PURE__ */ jsx(MinusCircle, { className: "h-4 w-4 text-amber-400" }) }),
        /* @__PURE__ */ jsx(MiniStat, { label: "Negative Mark", value: `-${negativeMark.toFixed(2)}`, icon: /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4 text-rose-400" }) }),
        /* @__PURE__ */ jsx(MiniStat, { label: "Final Score", value: `${finalScore.toFixed(2)} / ${total}`, icon: /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4 text-[var(--brand-cyan)]" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-3", children: [
        /* @__PURE__ */ jsxs("button", { onClick: onRestart, className: "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 btn-gradient btn-gradient-hover", children: [
          /* @__PURE__ */ jsx(RotateCw, { className: "h-4 w-4" }),
          " Build another"
        ] }),
        /* @__PURE__ */ jsx(Link, { to: "/dashboard", className: "glass inline-flex items-center gap-2 rounded-xl px-5 py-2.5", children: "Dashboard" }),
        /* @__PURE__ */ jsx(Link, { to: "/leaderboard", className: "glass inline-flex items-center gap-2 rounded-xl px-5 py-2.5", children: "Leaderboard" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-4 text-2xl font-bold", children: "Review your answers" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: questions.map((q, i) => {
        const sel = answers[i];
        const isCorrect = sel === q.correct;
        return /* @__PURE__ */ jsx("div", { className: "glass rounded-2xl p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: `mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${isCorrect ? "bg-emerald-500/20 text-emerald-300" : sel ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-300"}`, children: i + 1 }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-1 text-xs text-muted-foreground", children: [
              q.subjectName,
              " · ",
              q.chapterTitle
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "flex-1 font-medium leading-relaxed", children: q.text }),
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
                subjectName: q.subjectName,
                chapterTitle: q.chapterTitle
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
function MiniStat({
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
export {
  RandomExamPage as component
};
