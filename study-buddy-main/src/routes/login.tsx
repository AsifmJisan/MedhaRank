import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { login } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — MedhaRank" }, { name: "description", content: "Login to MedhaRank to continue your exam preparation." }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try { login(email, password); navigate({ to: "/dashboard" }); }
    catch (err) { setError((err as Error).message); }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="glass-strong rounded-3xl p-8">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Login to continue your prep journey.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <Field label="Password" type="password" value={password} onChange={setPassword} />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button className="w-full rounded-xl px-4 py-3 btn-gradient btn-gradient-hover">Login</button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          New here? <Link to="/register" className="text-[var(--brand-cyan)] hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} required
        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none transition focus:border-[var(--brand-cyan)] focus:bg-white/10"
      />
    </label>
  );
}
