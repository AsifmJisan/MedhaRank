import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getSubject, slugifyChapter, type Subject } from "@/lib/data";
import { ArrowLeft, Play } from "lucide-react";

export const Route = createFileRoute("/subjects/$subject/")({
  head: ({ params }) => {
    const subj = getSubject(params.subject);
    return { meta: [{ title: `${subj?.name ?? "Subject"} — MedhaRank` }, { name: "description", content: `Chapters and exams for ${subj?.name ?? "this subject"}.` }] };
  },
  loader: ({ params }) => {
    const subj = getSubject(params.subject);
    if (!subj) throw notFound();
    return { subject: subj };
  },
  component: ChapterListPage,
});

function ChapterListPage() {
  const { subject } = Route.useLoaderData() as { subject: Subject };
  return (
    <div className="space-y-6">
      <Link to="/subjects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white">
        <ArrowLeft className="h-4 w-4" /> All subjects
      </Link>
      <div className="glass-strong rounded-3xl p-8">
        <div className="flex items-center gap-4">
          <div className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${subject.gradient} text-4xl`}>{subject.icon}</div>
          <div>
            <div className="text-sm text-muted-foreground">{subject.nameBn}</div>
            <h1 className="text-3xl font-bold">{subject.name}</h1>
            <p className="text-sm text-muted-foreground">{subject.chapters.length} chapters available</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {subject.chapters.map((c, i) => (
          <Link key={i} to="/exam/$subject/$chapter" params={{ subject: subject.slug, chapter: slugifyChapter(c.title) }}
            className="glass-glow glass-glow-hover group rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Chapter {i + 1}</div>
                <h3 className="font-display text-lg font-semibold leading-snug">{c.title}</h3>
                {c.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>}
                <div className="mt-3 text-xs text-muted-foreground">{c.questions.length} questions</div>
              </div>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl btn-gradient transition group-hover:scale-110">
                <Play className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
