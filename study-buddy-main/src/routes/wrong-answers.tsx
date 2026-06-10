import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import {
  usePracticeData,
  removeWrongQuestion,
  clearWrongQuestions,
  questionKey,
  type WrongQuestion,
} from "@/lib/practice";
import { BookmarkButton } from "@/components/BookmarkButton";
import { CheckCircle2, XCircle, Trash2, RotateCw, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/wrong-answers")({
  head: () => ({ meta: [{ title: "Wrong Answer Practice — MedhaRank" }] }),
  component: WrongAnswersPage,
});

function WrongAnswersPage() {
  const navigate = useNavigate();
  useEffect(() => { if (!getCurrentUser()) navigate({ to: "/login" }); }, [navigate]);
  const { wrong } = usePracticeData();

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-400 text-2xl">⚠️</div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Wrong Answer Practice</h1>
              <p className="text-sm text-muted-foreground">{wrong.length} saved question{wrong.length === 1 ? "" : "s"} to review.</p>
            </div>
          </div>
          {wrong.length > 0 && (
            <button onClick={() => clearWrongQuestions()}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-200 hover:bg-rose-500/20">
              <Trash2 className="h-4 w-4" /> Clear All Wrong Questions
            </button>
          )}
        </div>
      </div>

      {wrong.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-[var(--brand-cyan)]" />
          No wrong answers saved yet. Take an exam and your mistakes will show up here.
          <div className="mt-4">
            <Link to="/subjects" className="text-[var(--brand-cyan)] hover:underline">Browse subjects →</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {wrong.map((q) => <WrongCard key={questionKey(q)} q={q} />)}
        </div>
      )}
    </div>
  );
}

function WrongCard({ q }: { q: WrongQuestion }) {
  const key = questionKey(q);
  const [practice, setPractice] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const gotItRight = picked === q.correct;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="text-xs text-muted-foreground">{q.subjectName} · {q.chapterTitle}</div>
        <BookmarkButton
          question={{ subjectSlug: q.subjectSlug, subjectName: q.subjectName, chapterTitle: q.chapterTitle, text: q.text, options: q.options, correct: q.correct, explanation: q.explanation }}
        />
      </div>
      <div className="font-medium leading-relaxed">{q.text}</div>

      <div className="mt-3 grid gap-1.5">
        {Object.entries(q.options).map(([k, v]) => {
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
          const content = (
            <>
              <span className="font-semibold uppercase">{k}.</span>
              <span className="flex-1">{v}</span>
              {!practice && isAnswer && <span className="text-xs text-emerald-300">Correct</span>}
              {!practice && isOldWrong && !isAnswer && <span className="text-xs text-rose-300">Your answer</span>}
              {practice && picked && isAnswer && <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
              {practice && isPicked && !isAnswer && <XCircle className="h-4 w-4 text-rose-300" />}
            </>
          );
          return practice && !picked ? (
            <button key={k} onClick={() => setPicked(k)}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm ${cls}`}>
              {content}
            </button>
          ) : (
            <div key={k} className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${cls}`}>
              {content}
            </div>
          );
        })}
      </div>

      {practice && picked && (
        <div className={`mt-3 rounded-lg border px-3 py-2 text-sm ${gotItRight ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : "border-rose-500/40 bg-rose-500/10 text-rose-200"}`}>
          {gotItRight ? "Correct! You can remove this from your wrong list." : "Not quite — try again or review the explanation below."}
        </div>
      )}

      {q.explanation && (
        <div className="mt-3 rounded-xl border border-[var(--brand-cyan)]/30 bg-[var(--brand-cyan)]/10 p-3 text-sm leading-relaxed">
          <span className="font-semibold text-[var(--brand-cyan)]">Explanation: </span>{q.explanation}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!practice ? (
          <button onClick={() => { setPractice(true); setPicked(null); }}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm btn-gradient btn-gradient-hover">
            <RotateCw className="h-4 w-4" /> Practice Again
          </button>
        ) : (
          <button onClick={() => { setPractice(false); setPicked(null); }}
            className="glass inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm">
            Done practicing
          </button>
        )}
        <button onClick={() => removeWrongQuestion(key)}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm ${gotItRight ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25" : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"}`}>
          <Trash2 className="h-4 w-4" /> Remove from Wrong List
        </button>
      </div>
    </div>
  );
}
