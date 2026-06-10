import { createFileRoute, Link } from "@tanstack/react-router";
import { SUBJECTS } from "@/lib/data";

export const Route = createFileRoute("/subjects/")({
  head: () => ({ meta: [{ title: "Subjects — MedhaRank" }, { name: "description", content: "Browse all subjects and chapters available on MedhaRank." }] }),
  component: SubjectsPage,
});

function SubjectsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">All Subjects</h1>
        <p className="mt-1 text-muted-foreground">Pick a subject to view its chapters and start practicing.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SUBJECTS.map((s) => {
          const totalQ = s.chapters.reduce((a, c) => a + c.questions.length, 0);
          return (
            <Link key={s.slug} to="/subjects/$subject" params={{ subject: s.slug }}
              className="glass-glow glass-glow-hover group rounded-2xl p-6">
              <div className={`mb-4 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br ${s.gradient} text-3xl`}>{s.icon}</div>
              <div className="text-xs text-muted-foreground">{s.nameBn}</div>
              <h2 className="text-xl font-semibold">{s.name}</h2>
              <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                <span>{s.chapters.length} chapters</span>
                <span>·</span>
                <span>{totalQ} questions</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
