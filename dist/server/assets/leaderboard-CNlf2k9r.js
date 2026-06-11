import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { g as getCurrentUser, c as getResults } from "./router-DLih9N2T.js";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Trophy, Medal, Award } from "lucide-react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine, Line } from "recharts";
import "@tanstack/react-query";
import "@tanstack/react-router";
function LeaderboardPage() {
  const [rows, setRows] = useState([]);
  const [meId, setMeId] = useState(null);
  const [myResults, setMyResults] = useState([]);
  useEffect(() => {
    const me = getCurrentUser();
    setMeId(me?.id ?? null);
    const all = getResults();
    if (me) {
      setMyResults(all.filter((r) => r.userId === me.id).sort((a, b) => a.createdAt - b.createdAt));
    }
    const map = /* @__PURE__ */ new Map();
    for (const r of all) {
      const cur = map.get(r.userId) ?? {
        userId: r.userId,
        name: r.userName,
        exams: 0,
        totalScore: 0,
        avg: 0,
        best: 0
      };
      cur.exams += 1;
      cur.totalScore += r.score;
      cur.best = Math.max(cur.best, r.score);
      map.set(r.userId, cur);
    }
    const arr = [...map.values()].map((r) => ({
      ...r,
      avg: Math.round(r.totalScore / r.exams)
    }));
    arr.sort((a, b) => b.avg - a.avg || b.exams - a.exams);
    setRows(arr);
  }, []);
  const chartData = myResults.map((r, i) => ({
    idx: i + 1,
    score: r.score,
    label: `${r.subjectName} · ${r.chapterTitle}`,
    date: new Date(r.createdAt).toLocaleDateString()
  }));
  const avgMy = chartData.length ? Math.round(chartData.reduce((s, d) => s + d.score, 0) / chartData.length) : 0;
  const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
  const lastHalf = chartData.slice(Math.floor(chartData.length / 2));
  const firstAvg = firstHalf.length ? firstHalf.reduce((s, d) => s + d.score, 0) / firstHalf.length : 0;
  const lastAvg = lastHalf.length ? lastHalf.reduce((s, d) => s + d.score, 0) / lastHalf.length : 0;
  const delta = Math.round(lastAvg - firstAvg);
  const best = chartData.reduce((m, d) => Math.max(m, d.score), 0);
  const trendIcon = delta > 1 ? TrendingUp : delta < -1 ? TrendingDown : Minus;
  const TrendIcon = trendIcon;
  const trendTone = delta > 1 ? "text-emerald-400" : delta < -1 ? "text-rose-400" : "text-muted-foreground";
  const trendLabel = delta > 1 ? "Improving" : delta < -1 ? "Declining" : "Steady";
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold", children: "Leaderboard" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-muted-foreground", children: "Ranked by average score across all exams." })
    ] }),
    meId && myResults.length > 0 && /* @__PURE__ */ jsxs("div", { className: "glass-strong rounded-2xl p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "font-display text-xl font-bold", children: "Your progress" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "Score across your last ",
            chartData.length,
            " exam",
            chartData.length === 1 ? "" : "s",
            "."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl px-4 py-2 text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Average" }),
            /* @__PURE__ */ jsxs("div", { className: "text-lg font-bold gradient-text", children: [
              avgMy,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl px-4 py-2 text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Best" }),
            /* @__PURE__ */ jsxs("div", { className: "text-lg font-bold gradient-text", children: [
              best,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl px-4 py-2 text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Trend" }),
            /* @__PURE__ */ jsxs("div", { className: `flex items-center justify-center gap-1 text-lg font-bold ${trendTone}`, children: [
              /* @__PURE__ */ jsx(TrendIcon, { className: "h-4 w-4" }),
              delta > 0 ? "+" : "",
              delta,
              "%"
            ] }),
            /* @__PURE__ */ jsx("div", { className: `text-[10px] uppercase tracking-wider ${trendTone}`, children: trendLabel })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-5 h-64 w-full", children: chartData.length < 2 ? /* @__PURE__ */ jsx("div", { className: "grid h-full place-items-center rounded-xl border border-dashed border-white/10 text-sm text-muted-foreground", children: "Take at least 2 exams to see your improvement trend." }) : /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart, { data: chartData, margin: {
        top: 10,
        right: 16,
        left: -10,
        bottom: 0
      }, children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "scoreStroke", x1: "0", y1: "0", x2: "1", y2: "0", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#22d3ee" }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#a855f7" })
        ] }) }),
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.08)" }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "idx", stroke: "rgba(255,255,255,0.5)", tick: {
          fontSize: 12
        } }),
        /* @__PURE__ */ jsx(YAxis, { domain: [0, 100], stroke: "rgba(255,255,255,0.5)", tick: {
          fontSize: 12
        } }),
        /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
          background: "rgba(15,18,30,0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          fontSize: 12
        }, labelFormatter: (v) => `Exam #${v}`, formatter: (value, _n, p) => [`${value}%`, p?.payload?.label ?? "Score"] }),
        /* @__PURE__ */ jsx(ReferenceLine, { y: avgMy, stroke: "rgba(255,255,255,0.25)", strokeDasharray: "4 4", label: {
          value: `avg ${avgMy}%`,
          fill: "rgba(255,255,255,0.5)",
          fontSize: 10,
          position: "insideTopRight"
        } }),
        /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "score", stroke: "url(#scoreStroke)", strokeWidth: 3, dot: {
          r: 4,
          fill: "#22d3ee"
        }, activeDot: {
          r: 6
        } })
      ] }) }) })
    ] }),
    rows.length === 0 ? /* @__PURE__ */ jsx("div", { className: "glass rounded-2xl p-10 text-center text-muted-foreground", children: "No results yet. Take an exam to appear on the leaderboard." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-3", children: rows.slice(0, 3).map((r, i) => {
        const Icon = [Trophy, Medal, Award][i];
        const tones = ["from-amber-400 to-yellow-600", "from-slate-300 to-slate-500", "from-orange-400 to-amber-700"];
        return /* @__PURE__ */ jsxs("div", { className: "glass-strong rounded-2xl p-6 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: `mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br ${tones[i]}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-7 w-7 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 text-xs text-muted-foreground", children: [
            "Rank #",
            i + 1
          ] }),
          /* @__PURE__ */ jsx("div", { className: "font-display text-lg font-bold", children: r.name }),
          /* @__PURE__ */ jsxs("div", { className: "mt-1 text-3xl font-bold gradient-text", children: [
            r.avg,
            "%"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
            r.exams,
            " exams · best ",
            r.best,
            "%"
          ] })
        ] }, r.userId);
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground", children: [
          /* @__PURE__ */ jsx("div", { className: "col-span-1", children: "#" }),
          /* @__PURE__ */ jsx("div", { className: "col-span-5", children: "Student" }),
          /* @__PURE__ */ jsx("div", { className: "col-span-2 text-right", children: "Exams" }),
          /* @__PURE__ */ jsx("div", { className: "col-span-2 text-right", children: "Best" }),
          /* @__PURE__ */ jsx("div", { className: "col-span-2 text-right", children: "Average" })
        ] }),
        rows.map((r, i) => {
          const rank = i + 1;
          const badge = rank === 1 ? "bg-gradient-to-br from-amber-300 to-yellow-600 text-black shadow-[0_0_18px_rgba(251,191,36,0.55)]" : rank === 2 ? "bg-gradient-to-br from-slate-200 to-slate-500 text-black shadow-[0_0_14px_rgba(203,213,225,0.45)]" : rank === 3 ? "bg-gradient-to-br from-orange-300 to-amber-700 text-black shadow-[0_0_14px_rgba(251,146,60,0.45)]" : "bg-white/10 text-white";
          return /* @__PURE__ */ jsxs("div", { className: `grid grid-cols-12 items-center px-4 py-3 text-sm transition ${r.userId === meId ? "bg-[var(--brand-cyan)]/10" : "hover:bg-white/5"}`, children: [
            /* @__PURE__ */ jsx("div", { className: "col-span-1", children: /* @__PURE__ */ jsx("span", { className: `grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${badge}`, children: rank }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-5 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "grid h-8 w-8 place-items-center rounded-full btn-gradient text-xs font-bold", children: r.name.charAt(0).toUpperCase() }),
              /* @__PURE__ */ jsxs("span", { children: [
                r.name,
                r.userId === meId && /* @__PURE__ */ jsx("span", { className: "ml-2 text-xs text-[var(--brand-cyan)]", children: "(you)" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "col-span-2 text-right", children: r.exams }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-2 text-right", children: [
              r.best,
              "%"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-2 text-right font-bold gradient-text", children: [
              r.avg,
              "%"
            ] })
          ] }, r.userId);
        })
      ] })
    ] })
  ] });
}
export {
  LeaderboardPage as component
};
