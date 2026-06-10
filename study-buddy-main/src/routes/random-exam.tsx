import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { SUBJECTS, type Question } from "@/lib/data";
import { getCurrentUser, saveResult, type ExamResult } from "@/lib/auth";
import {
  Shuffle, Clock, ArrowLeft, ArrowRight, CheckCircle2, XCircle, Trophy, RotateCw, Sparkles,
  HelpCircle, MinusCircle,
} from "lucide-react";
import { saveWrongQuestion } from "@/lib/practice";
import { BookmarkButton } from "@/components/BookmarkButton";
import { setAiTutorContext } from "@/lib/aiTutorContext";

export const Route = createFileRoute("/random-exam")({
  head: () => ({
    meta: [
      { title: "Random Exam — MedhaRank" },
      { name: "description", content: "Build a custom random exam from any subject and chapter on MedhaRank." },
    ],
  }),
  component: RandomExamPage,
});

type PickedQuestion = Question & { subjectName: string; subjectSlug: string; chapterTitle: string };
type Phase = "setup" | "exam" | "result";

const QUESTION_PRESETS = [10, 20, 30, 50, 100];
const TIME_PRESETS = [10, 20, 30, 60];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function RandomExamPage() {
  const navigate = useNavigate();
  const user = useMemo(() => (typeof window !== "undefined" ? getCurrentUser() : null), []);
  useEffect(() => { if (typeof window !== "undefined" && !getCurrentUser()) navigate({ to: "/login" }); }, [navigate]);

  const [phase, setPhase] = useState<Phase>("setup");
  const [questions, setQuestions] = useState<PickedQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const submittedRef = useRef(false);

  if (!user) return null;

  if (phase === "setup") {
    return (
      <SetupView
        onStart={(picked, minutes) => {
          setQuestions(picked);
          setAnswers({});
          setCurrent(0);
          const total = minutes * 60;
          setTotalSeconds(total);
          setSecondsLeft(total);
          submittedRef.current = false;
          setPhase("exam");
        }}
      />
    );
  }

  if (phase === "exam") {
    const handleSubmit = (timeUsed: number) => {
      if (user) {
        const total = questions.length;
        const correct = questions.reduce((a, q, i) => a + (answers[i] === q.correct ? 1 : 0), 0);
        const wrong = questions.reduce((a, q, i) => a + (answers[i] && answers[i] !== q.correct ? 1 : 0), 0);
        const finalScore = Math.max(0, correct - wrong * 0.25);
        const score = total ? Math.round((finalScore / total) * 100) : 0;
        const result: ExamResult = {
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
          answers: questions.map((q, i) => ({ qIndex: i, selected: answers[i] ?? null, correct: q.correct })),
          questions: questions.map((q) => ({ text: q.text, options: q.options, correct: q.correct, explanation: q.explanation })),
          createdAt: Date.now(),
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
              timestamp: Date.now(),
            });
          }
        });
      }
      setPhase("result");
    };
    return (
      <ExamView
        questions={questions}
        answers={answers}
        setAnswers={setAnswers}
        current={current}
        setCurrent={setCurrent}
        secondsLeft={secondsLeft}
        setSecondsLeft={setSecondsLeft}
        totalSeconds={totalSeconds}
        submittedRef={submittedRef}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <ResultView
      questions={questions}
      answers={answers}
      timeUsed={totalSeconds - secondsLeft}
      onRestart={() => setPhase("setup")}
    />
  );
}

/* -------------------------------- SETUP -------------------------------- */

function SetupView({ onStart }: { onStart: (q: PickedQuestion[], minutes: number) => void }) {
  const [selectedSubjects, setSelectedSubjects] = useState<Record<string, boolean>>({});
  const [selectedChapters, setSelectedChapters] = useState<Record<string, boolean>>({}); // key: `${slug}::${title}`
  const [count, setCount] = useState<number>(20);
  const [minutes, setMinutes] = useState<number>(20);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const activeSubjects = SUBJECTS.filter((s) => selectedSubjects[s.slug]);

  const allSubjectsOn = SUBJECTS.every((s) => selectedSubjects[s.slug]);
  const toggleAllSubjects = () => {
    if (allSubjectsOn) {
      setSelectedSubjects({});
      setSelectedChapters({});
    } else {
      const next: Record<string, boolean> = {};
      SUBJECTS.forEach((s) => (next[s.slug] = true));
      setSelectedSubjects(next);
    }
  };

  const toggleSubject = (slug: string) => {
    setSelectedSubjects((p) => {
      const on = !p[slug];
      const next = { ...p, [slug]: on };
      if (!on) {
        // remove chapter selections for this subject
        setSelectedChapters((cp) => {
          const out: Record<string, boolean> = {};
          Object.keys(cp).forEach((k) => { if (!k.startsWith(`${slug}::`)) out[k] = cp[k]; });
          return out;
        });
      }
      return next;
    });
  };

  const toggleChapter = (slug: string, title: string) => {
    const key = `${slug}::${title}`;
    setSelectedChapters((p) => ({ ...p, [key]: !p[key] }));
  };

  const toggleAllChaptersFor = (slug: string) => {
    const subj = SUBJECTS.find((s) => s.slug === slug);
    if (!subj) return;
    const allOn = subj.chapters.every((c) => selectedChapters[`${slug}::${c.title}`]);
    setSelectedChapters((p) => {
      const next = { ...p };
      subj.chapters.forEach((c) => { next[`${slug}::${c.title}`] = !allOn; });
      return next;
    });
  };

  // Collect pool of available questions for current selection.
  const pool = useMemo<PickedQuestion[]>(() => {
    const out: PickedQuestion[] = [];
    activeSubjects.forEach((s) => {
      const chaptersOn = s.chapters.filter((c) => selectedChapters[`${s.slug}::${c.title}`]);
      // If subject is selected but no chapters checked, include ALL its chapters by default.
      const effective = chaptersOn.length ? chaptersOn : s.chapters;
      effective.forEach((c) => {
        c.questions.forEach((q) => {
          out.push({ ...q, subjectName: s.name, subjectSlug: s.slug, chapterTitle: c.title });
        });
      });
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubjects, selectedChapters]);

  const start = () => {
    setError(null);
    setInfo(null);
    if (activeSubjects.length === 0) { setError("Select at least one subject."); return; }
    if (!count || count < 1) { setError("Set a valid question count."); return; }
    if (!minutes || minutes < 1) { setError("Set a valid exam time."); return; }
    if (pool.length === 0) { setError("No questions are available from your selection."); return; }

    const take = Math.min(count, pool.length);
    const picked = shuffle(pool).slice(0, take);
    if (take < count) setInfo(`Only ${pool.length} questions are available from your selected chapters.`);
    onStart(picked, minutes);
  };

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl btn-gradient">
            <Shuffle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Random Exam</h1>
            <p className="text-sm text-muted-foreground">Build a custom mock from any subjects and chapters.</p>
          </div>
        </div>
      </div>

      {/* Subjects */}
      <section className="glass rounded-2xl p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">1. Choose subjects</h2>
          <button onClick={toggleAllSubjects} className="rounded-lg px-3 py-1.5 text-xs glass hover:bg-white/10">
            {allSubjectsOn ? "Clear all" : "Select all subjects"}
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((s) => {
            const on = !!selectedSubjects[s.slug];
            const totalQ = s.chapters.reduce((a, c) => a + c.questions.length, 0);
            return (
              <button
                key={s.slug}
                onClick={() => toggleSubject(s.slug)}
                className={`text-left rounded-2xl p-4 transition border ${
                  on ? "border-[var(--brand-cyan)] bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${s.gradient} text-xl`}>{s.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.chapters.length} chapters · {totalQ} Qs</div>
                  </div>
                  <span className={`grid h-5 w-5 place-items-center rounded-md border ${on ? "border-[var(--brand-cyan)] bg-[var(--brand-cyan)]/30" : "border-white/20"}`}>
                    {on && <CheckCircle2 className="h-4 w-4 text-[var(--brand-cyan)]" />}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Chapters */}
      {activeSubjects.length > 0 && (
        <section className="glass rounded-2xl p-5">
          <h2 className="mb-3 text-lg font-semibold">2. Choose chapters <span className="text-xs text-muted-foreground">(leave empty for all chapters of a subject)</span></h2>
          <div className="space-y-5">
            {activeSubjects.map((s) => {
              const allOn = s.chapters.every((c) => selectedChapters[`${s.slug}::${c.title}`]);
              return (
                <div key={s.slug}>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{s.icon} {s.name}</div>
                    <button onClick={() => toggleAllChaptersFor(s.slug)} className="rounded-lg px-2.5 py-1 text-xs glass hover:bg-white/10">
                      {allOn ? "Clear" : "Select all"}
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {s.chapters.map((c) => {
                      const key = `${s.slug}::${c.title}`;
                      const on = !!selectedChapters[key];
                      return (
                        <button
                          key={key}
                          onClick={() => toggleChapter(s.slug, c.title)}
                          className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                            on ? "border-[var(--brand-cyan)] bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          <span className="min-w-0 flex-1 truncate">{c.title}</span>
                          <span className="text-[10px] text-muted-foreground">{c.questions.length}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Count & Time */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="mb-3 text-lg font-semibold">3. Number of questions</h2>
          <div className="flex flex-wrap gap-2">
            {QUESTION_PRESETS.map((n) => (
              <button key={n} onClick={() => setCount(n)}
                className={`rounded-xl px-4 py-2 text-sm transition ${count === n ? "btn-gradient" : "glass hover:bg-white/10"}`}>
                {n}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <label className="text-xs text-muted-foreground">Custom</label>
            <input
              type="number" min={1} max={500} value={count}
              onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 0))}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--brand-cyan)]"
            />
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="mb-3 text-lg font-semibold">4. Exam time (minutes)</h2>
          <div className="flex flex-wrap gap-2">
            {TIME_PRESETS.map((n) => (
              <button key={n} onClick={() => setMinutes(n)}
                className={`rounded-xl px-4 py-2 text-sm transition ${minutes === n ? "btn-gradient" : "glass hover:bg-white/10"}`}>
                {n} min
              </button>
            ))}
          </div>
          <div className="mt-3">
            <label className="text-xs text-muted-foreground">Custom (minutes)</label>
            <input
              type="number" min={1} max={300} value={minutes}
              onChange={(e) => setMinutes(Math.max(1, Number(e.target.value) || 0))}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--brand-cyan)]"
            />
          </div>
        </div>
      </section>

      <div className="glass rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            <Sparkles className="mr-1 inline h-4 w-4 text-[var(--brand-cyan)]" />
            Pool available: <span className="font-semibold text-white">{pool.length}</span> questions · You'll get <span className="font-semibold text-white">{Math.min(count, pool.length) || 0}</span>
          </div>
          <button onClick={start} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 btn-gradient btn-gradient-hover">
            <Shuffle className="h-4 w-4" /> Start Random Exam
          </button>
        </div>
        {error && <div className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}
        {info && <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">{info}</div>}
      </div>
    </div>
  );
}

/* --------------------------------- EXAM --------------------------------- */

function ExamView({
  questions, answers, setAnswers, current, setCurrent,
  secondsLeft, setSecondsLeft, totalSeconds, submittedRef, onSubmit,
}: {
  questions: PickedQuestion[];
  answers: Record<number, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  current: number;
  setCurrent: React.Dispatch<React.SetStateAction<number>>;
  secondsLeft: number;
  setSecondsLeft: React.Dispatch<React.SetStateAction<number>>;
  totalSeconds: number;
  submittedRef: React.MutableRefObject<boolean>;
  onSubmit: (timeUsed: number) => void;
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
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / total) * 100);
  const q = questions[current];
  const optionKeys = Object.keys(q.options);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const timePct = totalSeconds ? Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100)) : 0;
  const lowTime = secondsLeft <= 30;

  const handleSubmit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    onSubmit(totalSeconds - secondsLeft);
  };

  return (
    <div className="space-y-5">
      <div className="glass-strong rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Random Exam</div>
            <h1 className="text-xl font-bold sm:text-2xl">{q.subjectName} · {q.chapterTitle}</h1>
          </div>
          <div className={`glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ${lowTime ? "text-rose-300" : ""}`}>
            <Clock className={`h-4 w-4 ${lowTime ? "text-rose-400" : "text-[var(--brand-cyan)]"}`} /> {mm}:{ss}
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Question {current + 1} of {total}</span>
            <span>{answeredCount}/{total} answered · {progress}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--brand-cyan), var(--brand-blue), var(--brand-purple))", boxShadow: "0 0 18px oklch(0.65 0.22 280 / 60%)" }} />
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
            <div className={`h-full rounded-full transition-all duration-500 ${lowTime ? "bg-rose-500" : "bg-[var(--brand-cyan)]"}`} style={{ width: `${timePct}%` }} />
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="mb-2 text-xs text-muted-foreground">{q.subjectName} · {q.chapterTitle}</div>
        <div className="flex items-start gap-3">
          <div className="flex-1 text-base font-medium leading-relaxed sm:text-lg">{q.text}</div>
          <BookmarkButton
            question={{
              subjectSlug: q.subjectSlug,
              subjectName: q.subjectName,
              chapterTitle: q.chapterTitle,
              text: q.text,
              options: q.options,
              correct: q.correct,
              explanation: q.explanation,
            }}
          />
        </div>
        <div className="mt-5 grid gap-2.5">
          {optionKeys.map((k) => {
            const selected = answers[current] === k;
            return (
              <button key={k} onClick={() => setAnswers((a) => ({ ...a, [current]: k }))}
                className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  selected ? "border-[var(--brand-cyan)] bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}>
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${selected ? "btn-gradient" : "bg-white/10"}`}>
                  {k.toUpperCase()}
                </span>
                <span className="leading-relaxed">{q.options[k]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}
          className="glass inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm disabled:opacity-40">
          <ArrowLeft className="h-4 w-4" /> Previous
        </button>
        <div className="flex max-w-full flex-wrap justify-center gap-1.5">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`h-8 w-8 rounded-lg text-xs font-medium transition ${
                i === current ? "btn-gradient" : answers[i] ? "bg-[var(--brand-cyan)]/30 text-white" : "bg-white/5 hover:bg-white/10"
              }`}>{i + 1}</button>
          ))}
        </div>
        {current === total - 1 ? (
          <button onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 btn-gradient btn-gradient-hover">
            <CheckCircle2 className="h-4 w-4" /> Submit exam
          </button>
        ) : (
          <button onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 btn-gradient btn-gradient-hover">
            Next <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <button onClick={handleSubmit} className="text-xs text-muted-foreground hover:text-white underline">
          Submit early
        </button>
      </div>
    </div>
  );
}

/* -------------------------------- RESULT -------------------------------- */

function ResultView({
  questions, answers, timeUsed, onRestart,
}: {
  questions: PickedQuestion[];
  answers: Record<number, string>;
  timeUsed: number;
  onRestart: () => void;
}) {
  const navigate = useNavigate();
  const total = questions.length;
  const correct = questions.reduce((a, q, i) => a + (answers[i] === q.correct ? 1 : 0), 0);
  const wrong = questions.reduce((a, q, i) => a + (answers[i] && answers[i] !== q.correct ? 1 : 0), 0);
  const unanswered = total - correct - wrong;
  const negativeMark = wrong * 0.25;
  const finalScore = Math.max(0, correct - negativeMark);
  const score = total ? Math.round((finalScore / total) * 100) : 0;
  const mm = String(Math.floor(timeUsed / 60)).padStart(2, "0");
  const ss = String(timeUsed % 60).padStart(2, "0");
  const grade = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Keep going" : "Needs practice";

  return (
    <div className="space-y-8">
      <div className="glass-strong rounded-3xl p-8 text-center">
        <Trophy className="mx-auto h-10 w-10 text-[var(--brand-cyan)] glow-pulse" />
        <p className="mt-2 text-sm text-muted-foreground">Random Exam · {total} questions</p>
        <div className="mt-4 text-6xl font-bold gradient-text">{score}%</div>
        <p className="mt-1 text-lg font-medium">{grade}</p>

        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
          <MiniStat label="Total Questions" value={total} icon={<HelpCircle className="h-4 w-4 text-[var(--brand-cyan)]" />} />
          <MiniStat label="Correct Answers" value={correct} icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} />
          <MiniStat label="Wrong Answers" value={wrong} icon={<XCircle className="h-4 w-4 text-rose-400" />} />
          <MiniStat label="Unanswered" value={unanswered} icon={<MinusCircle className="h-4 w-4 text-amber-400" />} />
          <MiniStat label="Negative Mark" value={`-${negativeMark.toFixed(2)}`} icon={<XCircle className="h-4 w-4 text-rose-400" />} />
          <MiniStat label="Final Score" value={`${finalScore.toFixed(2)} / ${total}`} icon={<Trophy className="h-4 w-4 text-[var(--brand-cyan)]" />} />
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={onRestart} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 btn-gradient btn-gradient-hover">
            <RotateCw className="h-4 w-4" /> Build another
          </button>
          <Link to="/dashboard" className="glass inline-flex items-center gap-2 rounded-xl px-5 py-2.5">Dashboard</Link>
          <Link to="/leaderboard" className="glass inline-flex items-center gap-2 rounded-xl px-5 py-2.5">Leaderboard</Link>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">Review your answers</h2>
        <div className="space-y-4">
          {questions.map((q, i) => {
            const sel = answers[i];
            const isCorrect = sel === q.correct;
            return (
              <div key={i} className="glass rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${isCorrect ? "bg-emerald-500/20 text-emerald-300" : sel ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-300"}`}>{i + 1}</span>
                  <div className="flex-1">
                    <div className="mb-1 text-xs text-muted-foreground">{q.subjectName} · {q.chapterTitle}</div>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 font-medium leading-relaxed">{q.text}</div>
                      <BookmarkButton
                        question={{
                          subjectSlug: q.subjectSlug,
                          subjectName: q.subjectName,
                          chapterTitle: q.chapterTitle,
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
                            subjectName: q.subjectName,
                            chapterTitle: q.chapterTitle,
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

function MiniStat({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}