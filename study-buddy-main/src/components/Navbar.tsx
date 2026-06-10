import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth, logout } from "@/lib/auth";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const PUBLIC_LINKS = [
  { to: "/", label: "Home" },
  { to: "/subjects", label: "Subjects" },
  { to: "/random-exam", label: "Random Exam" },
  { to: "/study", label: "Study Notes" },
  { to: "/live", label: "Live Exams" },
  { to: "/ai-teacher", label: "AI Tutor" },
  { to: "/leaderboard", label: "Leaderboard" },
];

export function Navbar() {
  const user = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const links = user ? [{ to: "/dashboard", label: "Dashboard" }, ...PUBLIC_LINKS.slice(1)] : PUBLIC_LINKS;

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass mx-auto mt-3 flex max-w-7xl items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center cursor-pointer" aria-label="MedhaRank home">
          <img src="/logo.png" alt="MedhaRank" className="h-10 w-auto sm:h-11" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                path === l.to ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/5">
                <div className="grid h-8 w-8 place-items-center rounded-full btn-gradient text-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm">{user.name.split(" ")[0]}</span>
              </Link>
              <button
                onClick={() => { logout(); navigate({ to: "/" }); }}
                className="rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-white"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-1.5 text-sm hover:bg-white/5">Login</Link>
              <Link to="/register" className="rounded-lg px-4 py-1.5 text-sm btn-gradient btn-gradient-hover">Get Started</Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button className="rounded-lg p-2 hover:bg-white/5" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden glass mx-auto mt-2 max-w-7xl rounded-2xl p-3">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm ${path === l.to ? "bg-white/10" : "hover:bg-white/5"}`}>
                {l.label}
              </Link>
            ))}
            <div className="my-1 h-px bg-white/10" />
            {user ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-white/5">Profile ({user.name})</Link>
                <button onClick={() => { logout(); setOpen(false); navigate({ to: "/" }); }} className="rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-white/5">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm btn-gradient btn-gradient-hover text-center">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
