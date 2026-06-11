import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { g as getCurrentUser, c as getResults, S as SUBJECTS } from "./router-DLih9N2T.js";
import { BookOpen, Target, Trophy, Clock } from "lucide-react";
import "@tanstack/react-query";
function Dashboard() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!getCurrentUser()) navigate({
      to: "/login"
    });
  }, [navigate]);
  const user = getCurrentUser();
  if (!user) return null;
  const myResults = getResults().filter((r) => r.userId === user.id);
  const totalExams = myResults.length;
  const avgScore = totalExams ? Math.round(myResults.reduce((a, r) => a + r.score, 0) / totalExams) : 0;
  const totalCorrect = myResults.reduce((a, r) => a + r.correct, 0);
  const totalAnswered = myResults.reduce((a, r) => a + r.total, 0);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Welcome back," }),
      /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-bold", children: [
        user.name,
        " 👋"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(Stat, { icon: BookOpen, label: "Exams taken", value: totalExams, tone: "from-sky-400 to-blue-600" }),
      /* @__PURE__ */ jsx(Stat, { icon: Target, label: "Average score", value: `${avgScore}%`, tone: "from-violet-400 to-fuchsia-600", progress: avgScore }),
      /* @__PURE__ */ jsx(Stat, { icon: Trophy, label: "Correct answers", value: `${totalCorrect}/${totalAnswered}`, tone: "from-emerald-400 to-teal-600", progress: totalAnswered ? Math.round(totalCorrect / totalAnswered * 100) : 0 }),
      /* @__PURE__ */ jsx(Stat, { icon: Clock, label: "Member since", value: new Date(user.createdAt).toLocaleDateString(), tone: "from-amber-400 to-orange-600" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/wrong-answers", className: "glass-glow glass-glow-hover flex items-center gap-4 rounded-2xl p-5", children: [
        /* @__PURE__ */ jsx("div", { className: "grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-400 text-2xl", children: "⚠️" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Wrong Answer Practice" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Review and retry the questions you got wrong." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Link, { to: "/bookmarks", className: "glass-glow glass-glow-hover flex items-center gap-4 rounded-2xl p-5", children: [
        /* @__PURE__ */ jsx("div", { className: "grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-400 text-2xl", children: "🔖" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Bookmarked Questions" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Your saved questions, ready to practice anytime." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-end justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "Jump into a subject" }),
        /* @__PURE__ */ jsx(Link, { to: "/subjects", className: "text-sm text-[var(--brand-cyan)] hover:underline", children: "All subjects →" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: SUBJECTS.map((s) => /* @__PURE__ */ jsxs(Link, { to: "/subjects/$subject", params: {
        subject: s.slug
      }, className: "glass-glow glass-glow-hover group rounded-2xl p-6", children: [
        /* @__PURE__ */ jsx("div", { className: `mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${s.gradient} text-2xl`, children: s.icon }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: s.name }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
          s.chapters.length,
          " chapters"
        ] })
      ] }, s.slug)) })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-4 text-2xl font-bold", children: "Recent results" }),
      myResults.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl p-8 text-center text-muted-foreground", children: [
        "No exams yet. ",
        /* @__PURE__ */ jsx(Link, { to: "/subjects", className: "text-[var(--brand-cyan)] hover:underline", children: "Start your first exam →" })
      ] }) : /* @__PURE__ */ jsx("div", { className: "glass divide-y divide-white/10 rounded-2xl", children: myResults.slice(-6).reverse().map((r) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium", children: r.chapterTitle }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
            r.subjectName,
            " · ",
            new Date(r.createdAt).toLocaleString()
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-lg font-bold gradient-text", children: [
            r.score,
            "%"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
            r.correct,
            "/",
            r.total
          ] })
        ] })
      ] }, r.id)) })
    ] })
  ] });
}
function Stat({
  icon: Icon,
  label,
  value,
  tone = "from-sky-400 to-blue-600",
  progress
}) {
  return /* @__PURE__ */ jsxs("div", { className: "glass-glow glass-glow-hover relative overflow-hidden rounded-2xl p-5", children: [
    /* @__PURE__ */ jsx("div", { className: `absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${tone} opacity-20 blur-2xl` }),
    /* @__PURE__ */ jsxs("div", { className: "relative flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: `grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${tone} shadow-lg`, children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5 text-white" }) }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: label }),
        /* @__PURE__ */ jsx("div", { className: "truncate text-xl font-bold", children: value })
      ] })
    ] }),
    typeof progress === "number" && /* @__PURE__ */ jsx("div", { className: "relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/10", children: /* @__PURE__ */ jsx("div", { className: `h-full rounded-full bg-gradient-to-r ${tone} transition-all duration-700`, style: {
      width: `${Math.min(100, Math.max(0, progress))}%`
    } }) })
  ] });
}
export {
  Dashboard as component
};
