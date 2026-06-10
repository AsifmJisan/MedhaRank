import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getCurrentUser, getResults } from "@/lib/auth";
import { SUBJECTS } from "@/lib/data";
import { BookOpen, Trophy, Target, Clock } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MedhaRank" }] }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  useEffect(() => { if (!getCurrentUser()) navigate({ to: "/login" }); }, [navigate]);
  const user = getCurrentUser();
  if (!user) return null;

  const myResults = getResults().filter((r) => r.userId === user.id);
  const totalExams = myResults.length;
  const avgScore = totalExams ? Math.round(myResults.reduce((a, r) => a + r.score, 0) / totalExams) : 0;
  const totalCorrect = myResults.reduce((a, r) => a + r.correct, 0);
  const totalAnswered = myResults.reduce((a, r) => a + r.total, 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="text-3xl font-bold">{user.name} 👋</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={BookOpen} label="Exams taken" value={totalExams} tone="from-sky-400 to-blue-600" />
        <Stat icon={Target} label="Average score" value={`${avgScore}%`} tone="from-violet-400 to-fuchsia-600" progress={avgScore} />
        <Stat icon={Trophy} label="Correct answers" value={`${totalCorrect}/${totalAnswered}`} tone="from-emerald-400 to-teal-600" progress={totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0} />
        <Stat icon={Clock} label="Member since" value={new Date(user.createdAt).toLocaleDateString()} tone="from-amber-400 to-orange-600" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/wrong-answers" className="glass-glow glass-glow-hover flex items-center gap-4 rounded-2xl p-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-400 text-2xl">⚠️</div>
          <div>
            <h3 className="text-lg font-semibold">Wrong Answer Practice</h3>
            <p className="text-sm text-muted-foreground">Review and retry the questions you got wrong.</p>
          </div>
        </Link>
        <Link to="/bookmarks" className="glass-glow glass-glow-hover flex items-center gap-4 rounded-2xl p-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-400 text-2xl">🔖</div>
          <div>
            <h3 className="text-lg font-semibold">Bookmarked Questions</h3>
            <p className="text-sm text-muted-foreground">Your saved questions, ready to practice anytime.</p>
          </div>
        </Link>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Jump into a subject</h2>
          <Link to="/subjects" className="text-sm text-[var(--brand-cyan)] hover:underline">All subjects →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((s) => (
            <Link key={s.slug} to="/subjects/$subject" params={{ subject: s.slug }}
              className="glass-glow glass-glow-hover group rounded-2xl p-6">
              <div className={`mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${s.gradient} text-2xl`}>{s.icon}</div>
              <h3 className="text-lg font-semibold">{s.name}</h3>
              <p className="text-sm text-muted-foreground">{s.chapters.length} chapters</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Recent results</h2>
        {myResults.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-muted-foreground">
            No exams yet. <Link to="/subjects" className="text-[var(--brand-cyan)] hover:underline">Start your first exam →</Link>
          </div>
        ) : (
          <div className="glass divide-y divide-white/10 rounded-2xl">
            {myResults.slice(-6).reverse().map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">{r.chapterTitle}</div>
                  <div className="text-xs text-muted-foreground">{r.subjectName} · {new Date(r.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold gradient-text">{r.score}%</div>
                  <div className="text-xs text-muted-foreground">{r.correct}/{r.total}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone = "from-sky-400 to-blue-600", progress }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode; tone?: string; progress?: number }) {
  return (
    <div className="glass-glow glass-glow-hover relative overflow-hidden rounded-2xl p-5">
      <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${tone} opacity-20 blur-2xl`} />
      <div className="relative flex items-center gap-3">
        <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${tone} shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="truncate text-xl font-bold">{value}</div>
        </div>
      </div>
      {typeof progress === "number" && (
        <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className={`h-full rounded-full bg-gradient-to-r ${tone} transition-all duration-700`} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
        </div>
      )}
    </div>
  );
}
