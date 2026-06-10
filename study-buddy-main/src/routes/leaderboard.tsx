import { createFileRoute } from "@tanstack/react-router";
import { getResults, getCurrentUser, type ExamResult } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — MedhaRank" }, { name: "description", content: "Top performers across MedhaRank exams." }] }),
  component: LeaderboardPage,
});

type Row = { userId: string; name: string; exams: number; totalScore: number; avg: number; best: number };

function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [meId, setMeId] = useState<string | null>(null);
  const [myResults, setMyResults] = useState<ExamResult[]>([]);

  useEffect(() => {
    const me = getCurrentUser();
    setMeId(me?.id ?? null);
    const all = getResults();
    if (me) {
      setMyResults(
        all
          .filter((r) => r.userId === me.id)
          .sort((a, b) => a.createdAt - b.createdAt),
      );
    }
    const map = new Map<string, Row>();
    for (const r of all) {
      const cur = map.get(r.userId) ?? { userId: r.userId, name: r.userName, exams: 0, totalScore: 0, avg: 0, best: 0 };
      cur.exams += 1;
      cur.totalScore += r.score;
      cur.best = Math.max(cur.best, r.score);
      map.set(r.userId, cur);
    }
    const arr = [...map.values()].map((r) => ({ ...r, avg: Math.round(r.totalScore / r.exams) }));
    arr.sort((a, b) => b.avg - a.avg || b.exams - a.exams);
    setRows(arr);
  }, []);

  const chartData = myResults.map((r, i) => ({
    idx: i + 1,
    score: r.score,
    label: `${r.subjectName} · ${r.chapterTitle}`,
    date: new Date(r.createdAt).toLocaleDateString(),
  }));
  const avgMy = chartData.length
    ? Math.round(chartData.reduce((s, d) => s + d.score, 0) / chartData.length)
    : 0;
  const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
  const lastHalf = chartData.slice(Math.floor(chartData.length / 2));
  const firstAvg = firstHalf.length
    ? firstHalf.reduce((s, d) => s + d.score, 0) / firstHalf.length
    : 0;
  const lastAvg = lastHalf.length
    ? lastHalf.reduce((s, d) => s + d.score, 0) / lastHalf.length
    : 0;
  const delta = Math.round(lastAvg - firstAvg);
  const best = chartData.reduce((m, d) => Math.max(m, d.score), 0);
  const trendIcon = delta > 1 ? TrendingUp : delta < -1 ? TrendingDown : Minus;
  const TrendIcon = trendIcon;
  const trendTone =
    delta > 1
      ? "text-emerald-400"
      : delta < -1
        ? "text-rose-400"
        : "text-muted-foreground";
  const trendLabel =
    delta > 1 ? "Improving" : delta < -1 ? "Declining" : "Steady";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="mt-1 text-muted-foreground">Ranked by average score across all exams.</p>
      </div>

      {meId && myResults.length > 0 && (
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold">Your progress</h2>
              <p className="text-sm text-muted-foreground">
                Score across your last {chartData.length} exam
                {chartData.length === 1 ? "" : "s"}.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="glass rounded-xl px-4 py-2 text-center">
                <div className="text-xs text-muted-foreground">Average</div>
                <div className="text-lg font-bold gradient-text">{avgMy}%</div>
              </div>
              <div className="glass rounded-xl px-4 py-2 text-center">
                <div className="text-xs text-muted-foreground">Best</div>
                <div className="text-lg font-bold gradient-text">{best}%</div>
              </div>
              <div className="glass rounded-xl px-4 py-2 text-center">
                <div className="text-xs text-muted-foreground">Trend</div>
                <div className={`flex items-center justify-center gap-1 text-lg font-bold ${trendTone}`}>
                  <TrendIcon className="h-4 w-4" />
                  {delta > 0 ? "+" : ""}{delta}%
                </div>
                <div className={`text-[10px] uppercase tracking-wider ${trendTone}`}>{trendLabel}</div>
              </div>
            </div>
          </div>

          <div className="mt-5 h-64 w-full">
            {chartData.length < 2 ? (
              <div className="grid h-full place-items-center rounded-xl border border-dashed border-white/10 text-sm text-muted-foreground">
                Take at least 2 exams to see your improvement trend.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="idx" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,18,30,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    labelFormatter={(v) => `Exam #${v}`}
                    formatter={(value: number, _n, p: any) => [`${value}%`, p?.payload?.label ?? "Score"]}
                  />
                  <ReferenceLine y={avgMy} stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" label={{ value: `avg ${avgMy}%`, fill: "rgba(255,255,255,0.5)", fontSize: 10, position: "insideTopRight" }} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="url(#scoreStroke)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#22d3ee" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
          No results yet. Take an exam to appear on the leaderboard.
        </div>
      ) : (
        <>
          {/* Podium */}
          <div className="grid gap-4 sm:grid-cols-3">
            {rows.slice(0, 3).map((r, i) => {
              const Icon = [Trophy, Medal, Award][i];
              const tones = ["from-amber-400 to-yellow-600", "from-slate-300 to-slate-500", "from-orange-400 to-amber-700"];
              return (
                <div key={r.userId} className="glass-strong rounded-2xl p-6 text-center">
                  <div className={`mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br ${tones[i]}`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">Rank #{i + 1}</div>
                  <div className="font-display text-lg font-bold">{r.name}</div>
                  <div className="mt-1 text-3xl font-bold gradient-text">{r.avg}%</div>
                  <div className="text-xs text-muted-foreground">{r.exams} exams · best {r.best}%</div>
                </div>
              );
            })}
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Student</div>
              <div className="col-span-2 text-right">Exams</div>
              <div className="col-span-2 text-right">Best</div>
              <div className="col-span-2 text-right">Average</div>
            </div>
            {rows.map((r, i) => {
              const rank = i + 1;
              const badge = rank === 1 ? "bg-gradient-to-br from-amber-300 to-yellow-600 text-black shadow-[0_0_18px_rgba(251,191,36,0.55)]"
                : rank === 2 ? "bg-gradient-to-br from-slate-200 to-slate-500 text-black shadow-[0_0_14px_rgba(203,213,225,0.45)]"
                : rank === 3 ? "bg-gradient-to-br from-orange-300 to-amber-700 text-black shadow-[0_0_14px_rgba(251,146,60,0.45)]"
                : "bg-white/10 text-white";
              return (
                <div key={r.userId} className={`grid grid-cols-12 items-center px-4 py-3 text-sm transition ${r.userId === meId ? "bg-[var(--brand-cyan)]/10" : "hover:bg-white/5"}`}>
                  <div className="col-span-1">
                    <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${badge}`}>{rank}</span>
                  </div>
                  <div className="col-span-5 flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full btn-gradient text-xs font-bold">{r.name.charAt(0).toUpperCase()}</div>
                    <span>{r.name}{r.userId === meId && <span className="ml-2 text-xs text-[var(--brand-cyan)]">(you)</span>}</span>
                  </div>
                  <div className="col-span-2 text-right">{r.exams}</div>
                  <div className="col-span-2 text-right">{r.best}%</div>
                  <div className="col-span-2 text-right font-bold gradient-text">{r.avg}%</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
