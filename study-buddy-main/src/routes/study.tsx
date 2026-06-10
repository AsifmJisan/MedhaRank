import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, ChevronRight, ArrowLeft } from "lucide-react";
import { STUDY_SETS, getStudySet, parseStudySet } from "@/lib/studyNotes";

export const Route = createFileRoute("/study")({
  head: () => ({ meta: [{ title: "Study Notes — MedhaRank" }, { name: "description", content: "Concise study notes organized by chapter and topic." }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    set: typeof search.set === "string" ? search.set : undefined,
  }),
  component: StudyPage,
});

function StudyPage() {
  const { set } = Route.useSearch();
  const activeSet = set ? getStudySet(set) : null;
  const [openChapter, setOpenChapter] = useState<number | null>(null);

  const titles = STUDY_SETS.map((s) => ({ set: s, meta: parseStudySet(s) })).filter((t) => t.meta.title);

  // Dashboard: show only the titles, nothing else.
  if (!activeSet) {
    return (
      <div lang="bn" className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Study Notes</h1>
          <p className="mt-1 text-muted-foreground">Select a book to view its chapters.</p>
        </div>
        {titles.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-muted-foreground">
            No study notes found.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {titles.map(({ set: s, meta }) => (
              <Link
                key={s.slug}
                to="/study"
                search={{ set: s.slug }}
                onClick={() => setOpenChapter(null)}
                className="glass-glow glass-glow-hover group flex items-center gap-3 rounded-2xl p-5"
              >
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${s.gradient} text-2xl`}>{s.icon}</div>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold">{meta.title}</h2>
                  <p className="text-xs text-muted-foreground">{meta.chapterCount} chapters</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const { title, chapters, chapterCount, topicCount } = parseStudySet(activeSet);

  if (!title && chapters.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Study Notes</h1>
        <div className="glass rounded-2xl p-8 text-center text-muted-foreground">
          No study notes found.
        </div>
      </div>
    );
  }

  const selected = openChapter !== null ? chapters[openChapter] : null;

  return (
    <div lang="bn" className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {STUDY_SETS.map((s) => {
          const meta = parseStudySet(s);
          if (!meta.title) return null;
          const active = s.slug === activeSet.slug;
          return (
            <Link
              key={s.slug}
              to="/study"
              search={{ set: s.slug }}
              onClick={() => setOpenChapter(null)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-gradient-to-r " + s.gradient + " text-white"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {meta.title}
            </Link>
          );
        })}
      </div>

      <div>
        <h1 className="text-3xl font-bold">{title ?? "Study Notes"}</h1>
        <p className="mt-1 text-muted-foreground">Chapter-wise topics with detailed explanations.</p>
        <div className="mt-3 flex gap-3 text-sm text-muted-foreground">
          <span>{chapterCount} chapters</span>
          <span>·</span>
          <span>{topicCount} topics</span>
        </div>
      </div>

      {chapters.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-muted-foreground">
          No study notes found.
        </div>
      ) : selected ? (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setOpenChapter(null)}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> All chapters
          </button>
          <div className="flex items-center gap-3">
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${activeSet.gradient} text-xl`}>
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold leading-snug">{selected.Chapter}</h2>
          </div>
          <div className="space-y-4">
            {(selected.Topic ?? []).map((topic, ti) => (
              <div key={ti} className="glass rounded-2xl border border-border/50 p-4 sm:p-5">
                <h3 className="font-semibold text-[var(--brand-cyan)]">{topic.TopicName}</h3>
                {topic.Explanation ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {topic.Explanation}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {chapters.map((chapter, ci) => (
            <button
              key={ci}
              type="button"
              onClick={() => setOpenChapter(ci)}
              className="glass-glow glass-glow-hover group flex items-center gap-3 rounded-2xl p-5 text-left"
            >
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${activeSet.gradient} text-xl`}>
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-semibold">{chapter.Chapter}</h2>
                <p className="text-xs text-muted-foreground">{chapter.Topic?.length ?? 0} topics</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
