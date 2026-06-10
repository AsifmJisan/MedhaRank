import { createFileRoute, Link } from "@tanstack/react-router";
import { SUBJECTS } from "@/lib/data";
import { ArrowRight, BookOpen, Trophy, Zap, Sparkles, Target } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MedhaRank — Premium Exam Preparation Platform" },
      { name: "description", content: "Practice MCQs, take live exams, climb the leaderboard. Built for Bangladeshi HSC, Medical & University admission students." },
    ],
  }),
  component: Home,
});

function Home() {
  const totalQuestions = SUBJECTS.reduce((a, s) => a + s.chapters.reduce((b, c) => b + c.questions.length, 0), 0);
  const totalChapters = SUBJECTS.reduce((a, s) => a + s.chapters.length, 0);

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="relative pt-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-[var(--brand-cyan)]" />
            Trusted by future doctors, engineers & scholars
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-6xl">
            Master every exam with{" "}
            <span className="gradient-text">MedhaRank</span>
          </h1>
          <p className="mt-5 text-base text-muted-foreground sm:text-lg">
            A premium MCQ practice platform for Physics, Chemistry, Math, Medical and University admission —
            with detailed Bangla explanations, live exams and a national leaderboard.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-xl px-6 py-3 btn-gradient btn-gradient-hover">
              Start practicing free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/subjects" className="glass inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium hover:bg-white/10">
              Browse subjects
            </Link>
          </div>

          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3">
            {[
              { v: SUBJECTS.length, l: "Subjects" },
              { v: totalChapters, l: "Chapters" },
              { v: `${totalQuestions}+`, l: "MCQs" },
            ].map((s) => (
              <div key={s.l} className="glass rounded-2xl p-4">
                <div className="text-2xl font-bold gradient-text">{s.v}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="mb-8 text-center text-3xl font-bold">Everything you need to top the merit list</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { i: BookOpen, t: "Chapter-wise MCQs", d: "Practice from a curated bank of admission-quality questions, organized chapter by chapter." },
            { i: Target, t: "Detailed explanations", d: "Every question comes with a step-by-step Bangla explanation — learn the why, not just the answer." },
            { i: Zap, t: "Live & daily exams", d: "Compete in scheduled live exams and daily challenges to keep your prep sharp." },
            { i: Trophy, t: "National leaderboard", d: "See where you rank against thousands of students. Earn rank badges as you climb." },
            { i: Sparkles, t: "Study notes library", d: "Concise, exam-focused notes for every chapter — perfect for quick revision." },
            { i: ArrowRight, t: "Smart progress", d: "Track your accuracy, time and streaks. Know exactly what to revise next." },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="glass-glow glass-glow-hover rounded-2xl p-6">
              <div className="grid h-10 w-10 place-items-center rounded-xl btn-gradient">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects preview */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl font-bold">Subjects</h2>
          <Link to="/subjects" className="text-sm text-[var(--brand-cyan)] hover:underline">View all →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((s) => (
            <Link key={s.slug} to="/subjects/$subject" params={{ subject: s.slug }}
              className="glass-glow glass-glow-hover group rounded-2xl p-6">
              <div className={`mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${s.gradient} text-2xl`}>
                {s.icon}
              </div>
              <div className="text-xs text-muted-foreground">{s.nameBn}</div>
              <h3 className="text-xl font-semibold">{s.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.chapters.length} chapters · {s.chapters.reduce((a, c) => a + c.questions.length, 0)} questions</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="glass-strong rounded-3xl p-10 text-center">
        <h2 className="text-3xl font-bold">Ready to top the merit list?</h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">Create a free account and start your first exam in under a minute.</p>
        <Link to="/register" className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 btn-gradient btn-gradient-hover">
          Join MedhaRank <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
