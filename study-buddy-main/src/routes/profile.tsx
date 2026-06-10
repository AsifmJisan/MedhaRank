import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getCurrentUser, getResults, updateUser, logout } from "@/lib/auth";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — MedhaRank" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getCurrentUser());
  const [name, setName] = useState(user?.name ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  if (!user) return null;

  const myResults = getResults().filter((r) => r.userId === user.id);
  const totalExams = myResults.length;
  const avg = totalExams ? Math.round(myResults.reduce((a, r) => a + r.score, 0) / totalExams) : 0;
  const best = myResults.reduce((a, r) => Math.max(a, r.score), 0);

  const save = () => {
    updateUser({ name });
    setUser(getCurrentUser());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="glass-strong rounded-3xl p-8">
        <div className="flex items-center gap-5">
          <div className="grid h-20 w-20 place-items-center rounded-2xl btn-gradient text-3xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Exams" value={totalExams} />
        <Stat label="Best score" value={`${best}%`} />
        <Stat label="Average" value={`${avg}%`} />
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold">Edit profile</h2>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs text-muted-foreground">Display name</span>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-[var(--brand-cyan)]" />
          </label>
          <div className="flex items-center gap-3">
            <button onClick={save} className="rounded-xl px-5 py-2.5 btn-gradient btn-gradient-hover">Save changes</button>
            {saved && <span className="text-sm text-emerald-400">Saved!</span>}
          </div>
        </div>
      </div>

      <button onClick={() => { logout(); navigate({ to: "/" }); }}
        className="w-full rounded-xl border border-rose-500/40 bg-rose-500/10 px-5 py-2.5 text-rose-300 hover:bg-rose-500/20">
        Sign out
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold gradient-text">{value}</div>
    </div>
  );
}
