import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getLastResult, type ExamResult } from "@/lib/auth";
import { CheckCircle2, XCircle, Clock, Trophy, RotateCw, HelpCircle, MinusCircle, Sparkles } from "lucide-react";
import { slugifyChapter } from "@/lib/data";
import { BookmarkButton } from "@/components/BookmarkButton";
import { setAiTutorContext } from "@/lib/aiTutorContext";

export const Route = createFileRoute("/result")({
  head: () => ({ meta: [{ title: "Result — MedhaRank" }] }),
  component: ResultPage,
});

function ResultPage() {
  const navigate = useNavigate();
  const [r, setR] = useState<ExamResult | null>(null);
  useEffect(() => {
    const last = getLastResult();
    if (!last) navigate({ to: "/dashboard" });
    else setR(last);
  }, [navigate]);

  if (!r) return null;

  const mm = String(Math.floor(r.durationSec / 60)).padStart(2, "0");
  const ss = String(r.durationSec % 60).padStart(2, "0");
  const wrong = r.wrong ?? (r.total - r.correct);
  const unanswered = r.total - r.correct - wrong;
  const negativeMark = wrong * 0.25;
  const finalScore = Math.max(0, r.correct - negativeMark);
  const grade = r.score >= 80 ? "Excellent" : r.score >= 60 ? "Good" : r.score >= 40 ? "Keep going" : "Needs practice";

  return (
    <div className="space-y-8">
      <div className="glass-strong rounded-3xl p-8 text-center">
        <Trophy className="mx-auto h-10 w-10 text-[var(--brand-cyan)] glow-pulse" />
        <p className="mt-2 text-sm text-muted-foreground">{r.subjectName} · {r.chapterTitle}</p>

        <CircularScore score={r.score} />

        <p className="mt-2 text-lg font-medium">{grade}</p>
        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Total Questions" value={r.total} icon={<HelpCircle className="h-4 w-4 text-[var(--brand-cyan)]" />} />
          <Stat label="Correct Answers" value={r.correct} icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} />
          <Stat label="Wrong Answers" value={wrong} icon={<XCircle className="h-4 w-4 text-rose-400" />} />
          <Stat label="Unanswered" value={unanswered} icon={<MinusCircle className="h-4 w-4 text-amber-400" />} />
          <Stat label="Negative Mark" value={`-${negativeMark.toFixed(2)}`} icon={<XCircle className="h-4 w-4 text-rose-400" />} />
          <Stat label="Final Score" value={`${finalScore.toFixed(2)} / ${r.total}`} icon={<Trophy className="h-4 w-4 text-[var(--brand-cyan)]" />} />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/exam/$subject/$chapter" params={{ subject: r.subjectSlug, chapter: slugifyChapter(r.chapterTitle) }}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 btn-gradient btn-gradient-hover">
            <RotateCw className="h-4 w-4" /> Retake exam
          </Link>
          <Link to="/dashboard" className="glass inline-flex items-center gap-2 rounded-xl px-5 py-2.5">Dashboard</Link>
          <Link to="/leaderboard" className="glass inline-flex items-center gap-2 rounded-xl px-5 py-2.5">Leaderboard</Link>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">Review your answers</h2>
        <div className="space-y-4">
          {r.questions.map((q, i) => {
            const sel = r.answers[i]?.selected;
            const isCorrect = sel === q.correct;
            return (
              <div key={i} className="glass rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${isCorrect ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 font-medium leading-relaxed">{q.text}</div>
                      <BookmarkButton
                        question={{
                          subjectSlug: r.subjectSlug,
                          subjectName: r.subjectName,
                          chapterTitle: r.chapterTitle,
                          text: q.text,
                          options: q.options,
                          correct: q.correct,
                          explanation: q.explanation,
                        }}
                      />
                    </div>
                    <div className="mt-3 grid gap-1.5">
                      {Object.entries(q.options).map(([k, v]) => {
                        const isAnswer = k === q.correct;
                        const isSelected = k === sel;
                        let cls = "border-white/10 bg-white/5";
                        if (isAnswer) cls = "border-emerald-500/50 bg-emerald-500/10";
                        else if (isSelected) cls = "border-rose-500/50 bg-rose-500/10";
                        return (
                          <div key={k} className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-sm ${cls}`}>
                            <span className="font-semibold uppercase">{k}.</span>
                            <span className="flex-1">{v}</span>
                            {isAnswer && <span className="text-xs text-emerald-300">Correct</span>}
                            {isSelected && !isAnswer && <span className="text-xs text-rose-300">Your answer</span>}
                          </div>
                        );
                      })}
                      {!sel && <div className="text-xs text-muted-foreground">You did not answer this question.</div>}
                    </div>
                    {q.explanation && (
                      <div className="mt-3 rounded-xl border border-[var(--brand-cyan)]/30 bg-[var(--brand-cyan)]/10 p-3 text-sm leading-relaxed">
                        <span className="font-semibold text-[var(--brand-cyan)]">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAiTutorContext({
                            text: q.text,
                            options: q.options,
                            correct: q.correct,
                            selected: sel ?? undefined,
                            explanation: q.explanation,
                            subjectName: r.subjectName,
                            chapterTitle: r.chapterTitle,
                          });
                          navigate({ to: "/ai-teacher" });
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium btn-gradient btn-gradient-hover shadow-md shadow-purple-500/20"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Ask AI Tutor
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

function CircularScore({ score }: { score: number }) {
  const size = 180;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = score >= 80 ? "#34d399" : score >= 60 ? "#60a5fa" : score >= 40 ? "#fbbf24" : "#fb7185";
  return (
    <div className="relative mx-auto mt-4 grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="cs-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.80 0.16 200)" />
            <stop offset="50%" stopColor="oklch(0.65 0.22 255)" />
            <stop offset="100%" stopColor="oklch(0.65 0.25 300)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="oklch(1 0 0 / 10%)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="url(#cs-grad)" strokeWidth={stroke} strokeLinecap="round" fill="none"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)", filter: `drop-shadow(0 0 12px ${color}99)` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-5xl font-bold gradient-text leading-none">{score}%</div>
          <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">Score</div>
        </div>
      </div>
    </div>
  );
}
