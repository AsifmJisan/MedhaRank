import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { s as slugifyChapter, S as SUBJECTS } from "./router-DLih9N2T.js";
import { useState, useEffect } from "react";
import { Flame, Zap, Calendar } from "lucide-react";
import "@tanstack/react-query";
function pick(seed) {
  const all = SUBJECTS.flatMap((s) => s.chapters.map((c) => ({
    s,
    c
  })));
  return all[seed % all.length];
}
function LivePage() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(/* @__PURE__ */ new Date());
    const t = setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
    return () => clearInterval(t);
  }, []);
  if (!now) return null;
  const dayKey = Math.floor(now.getTime() / (1e3 * 60 * 60 * 24));
  const weekKey = Math.floor(dayKey / 7);
  const daily = pick(dayKey);
  const weekly = pick(weekKey * 13 + 1);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const msToMid = endOfDay.getTime() - now.getTime();
  const hh = Math.floor(msToMid / 36e5);
  const mm = Math.floor(msToMid % 36e5 / 6e4);
  const ss = Math.floor(msToMid % 6e4 / 1e3);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold", children: "Live Exams" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-muted-foreground", children: "Fresh challenges every day and every week. Take them to climb the leaderboard." })
    ] }),
    /* @__PURE__ */ jsx(LiveCard, { tag: "Daily Challenge", icon: /* @__PURE__ */ jsx(Flame, { className: "h-6 w-6 text-white" }), gradient: "from-rose-500 to-orange-500", subject: daily.s.name, title: daily.c.title, count: daily.c.questions.length, timer: `Ends in ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`, to: {
      subject: daily.s.slug,
      chapter: slugifyChapter(daily.c.title)
    } }),
    /* @__PURE__ */ jsx(LiveCard, { tag: "Weekly Mega Exam", icon: /* @__PURE__ */ jsx(Zap, { className: "h-6 w-6 text-white" }), gradient: "from-indigo-500 to-purple-600", subject: weekly.s.name, title: weekly.c.title, count: weekly.c.questions.length, timer: "Refreshes every Monday", to: {
      subject: weekly.s.slug,
      chapter: slugifyChapter(weekly.c.title)
    } }),
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4" }),
        " Schedule"
      ] }),
      /* @__PURE__ */ jsxs("ul", { className: "mt-3 space-y-2 text-sm", children: [
        /* @__PURE__ */ jsx("li", { children: "· Daily Challenge — new chapter every 24 hours" }),
        /* @__PURE__ */ jsx("li", { children: "· Weekly Mega Exam — rotates every Monday" }),
        /* @__PURE__ */ jsxs("li", { children: [
          "· Subject Spotlight — pick any subject anytime from ",
          /* @__PURE__ */ jsx(Link, { to: "/subjects", className: "text-[var(--brand-cyan)] hover:underline", children: "All Subjects" })
        ] })
      ] })
    ] })
  ] });
}
function LiveCard({
  tag,
  icon,
  gradient,
  subject,
  title,
  count,
  timer,
  to
}) {
  return /* @__PURE__ */ jsx("div", { className: "glass-strong rounded-3xl p-6 sm:p-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: `grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${gradient}`, children: icon }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-[var(--brand-cyan)]", children: tag }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: subject }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold sm:text-2xl", children: title }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
          count,
          " questions · ",
          timer
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Link, { to: "/exam/$subject/$chapter", params: to, className: "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 btn-gradient btn-gradient-hover", children: "Start now" })
  ] }) });
}
export {
  LivePage as component
};
