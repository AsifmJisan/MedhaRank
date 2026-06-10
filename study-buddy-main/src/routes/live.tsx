import { createFileRoute, Link } from "@tanstack/react-router";
import { SUBJECTS, slugifyChapter } from "@/lib/data";
import { useEffect, useState } from "react";
import { Calendar, Flame, Zap } from "lucide-react";

export const Route = createFileRoute("/live")({
  head: () => ({ meta: [{ title: "Live Exams — MedhaRank" }, { name: "description", content: "Daily and weekly live exams to keep your prep sharp." }] }),
  component: LivePage,
});

// Picks a daily / weekly chapter deterministically so it stays the same per day/week.
function pick(seed: number) {
  const all = SUBJECTS.flatMap((s) => s.chapters.map((c) => ({ s, c })));
  return all[seed % all.length];
}

function LivePage() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  if (!now) return null;
  const dayKey = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  const weekKey = Math.floor(dayKey / 7);

  const daily = pick(dayKey);
  const weekly = pick(weekKey * 13 + 1);

  const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);
  const msToMid = endOfDay.getTime() - now.getTime();
  const hh = Math.floor(msToMid / 3_600_000);
  const mm = Math.floor((msToMid % 3_600_000) / 60_000);
  const ss = Math.floor((msToMid % 60_000) / 1000);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Live Exams</h1>
        <p className="mt-1 text-muted-foreground">Fresh challenges every day and every week. Take them to climb the leaderboard.</p>
      </div>

      <LiveCard
        tag="Daily Challenge"
        icon={<Flame className="h-6 w-6 text-white" />}
        gradient="from-rose-500 to-orange-500"
        subject={daily.s.name}
        title={daily.c.title}
        count={daily.c.questions.length}
        timer={`Ends in ${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}:${String(ss).padStart(2,"0")}`}
        to={{ subject: daily.s.slug, chapter: slugifyChapter(daily.c.title) }}
      />

      <LiveCard
        tag="Weekly Mega Exam"
        icon={<Zap className="h-6 w-6 text-white" />}
        gradient="from-indigo-500 to-purple-600"
        subject={weekly.s.name}
        title={weekly.c.title}
        count={weekly.c.questions.length}
        timer="Refreshes every Monday"
        to={{ subject: weekly.s.slug, chapter: slugifyChapter(weekly.c.title) }}
      />

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" /> Schedule
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          <li>· Daily Challenge — new chapter every 24 hours</li>
          <li>· Weekly Mega Exam — rotates every Monday</li>
          <li>· Subject Spotlight — pick any subject anytime from <Link to="/subjects" className="text-[var(--brand-cyan)] hover:underline">All Subjects</Link></li>
        </ul>
      </div>
    </div>
  );
}

function LiveCard({ tag, icon, gradient, subject, title, count, timer, to }: {
  tag: string; icon: React.ReactNode; gradient: string; subject: string; title: string; count: number; timer: string;
  to: { subject: string; chapter: string };
}) {
  return (
    <div className="glass-strong rounded-3xl p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${gradient}`}>{icon}</div>
          <div>
            <div className="text-xs uppercase tracking-wider text-[var(--brand-cyan)]">{tag}</div>
            <div className="text-xs text-muted-foreground">{subject}</div>
            <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
            <p className="text-sm text-muted-foreground">{count} questions · {timer}</p>
          </div>
        </div>
        <Link to="/exam/$subject/$chapter" params={to}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 btn-gradient btn-gradient-hover">
          Start now
        </Link>
      </div>
    </div>
  );
}
