import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import {
  usePracticeData,
  removeBookmark,
  clearBookmarks,
  questionKey,
  type SavedQuestion,
} from "@/lib/practice";
import { Bookmark, Trash2, CheckCircle2, XCircle, GraduationCap, Eye } from "lucide-react";

export const Route = createFileRoute("/bookmarks")({
  head: () => ({ meta: [{ title: "Bookmarked Questions — MedhaRank" }] }),
  component: BookmarksPage,
});

function BookmarksPage() {
  const navigate = useNavigate();
  useEffect(() => { if (!getCurrentUser()) navigate({ to: "/login" }); }, [navigate]);
  const { bookmarks } = usePracticeData();
  const [practice, setPractice] = useState(false);

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-400 text-2xl">🔖</div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Bookmarked Questions</h1>
              <p className="text-sm text-muted-foreground">{bookmarks.length} saved question{bookmarks.length === 1 ? "" : "s"}.</p>
            </div>
          </div>
          {bookmarks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setPractice((p) => !p)}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm btn-gradient btn-gradient-hover">
                {practice ? <Eye className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
                {practice ? "Show answers" : "Practice Bookmarked Questions"}
              </button>
              <button onClick={() => clearBookmarks()}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-200 hover:bg-rose-500/20">
                <Trash2 className="h-4 w-4" /> Clear All Bookmarks
              </button>
            </div>
          )}
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
          <Bookmark className="mx-auto mb-3 h-8 w-8 text-[var(--brand-cyan)]" />
          No bookmarks yet. Tap the bookmark icon beside any question to save it here.
          <div className="mt-4">
            <Link to="/subjects" className="text-[var(--brand-cyan)] hover:underline">Browse subjects →</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((q) => <BookmarkCard key={questionKey(q)} q={q} practice={practice} />)}
        </div>
      )}
    </div>
  );
}

function BookmarkCard({ q, practice }: { q: SavedQuestion; practice: boolean }) {
  const key = questionKey(q);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => { setPicked(null); }, [practice]);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-2 text-xs text-muted-foreground">{q.subjectName} · {q.chapterTitle}</div>
      <div className="font-medium leading-relaxed">{q.text}</div>

      <div className="mt-3 grid gap-1.5">
        {Object.entries(q.options).map(([k, v]) => {
          const isAnswer = k === q.correct;
          const isPicked = picked === k;
          let cls = "border-white/10 bg-white/5";
          if (practice) {
            if (picked) {
              if (isAnswer) cls = "border-emerald-500/50 bg-emerald-500/10";
              else if (isPicked) cls = "border-rose-500/50 bg-rose-500/10";
            } else {
              cls = "border-white/10 bg-white/5 hover:bg-white/10";
            }
          } else if (isAnswer) {
            cls = "border-emerald-500/50 bg-emerald-500/10";
          }
          const content = (
            <>
              <span className="font-semibold uppercase">{k}.</span>
              <span className="flex-1">{v}</span>
              {!practice && isAnswer && <span className="text-xs text-emerald-300">Correct</span>}
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

      {q.explanation && (!practice || picked) && (
        <div className="mt-3 rounded-xl border border-[var(--brand-cyan)]/30 bg-[var(--brand-cyan)]/10 p-3 text-sm leading-relaxed">
          <span className="font-semibold text-[var(--brand-cyan)]">Explanation: </span>{q.explanation}
        </div>
      )}

      <div className="mt-4">
        <button onClick={() => removeBookmark(key)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground hover:bg-white/10 hover:text-white">
          <Trash2 className="h-4 w-4" /> Remove Bookmark
        </button>
      </div>
    </div>
  );
}
