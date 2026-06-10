import { useState, useRef, useEffect } from "react";
import { Palette, Moon, Sun, ChevronDown } from "lucide-react";
import { useTheme, type Theme } from "@/lib/theme";

const OPTIONS: { value: Theme; label: string; icon: typeof Palette }[] = [
  { value: "default", label: "Default", icon: Palette },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[0];
  const CurrentIcon = current.icon;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
        aria-label="Change theme"
      >
        <CurrentIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
      </button>

      {open && (
        <div className="glass absolute right-0 z-50 mt-2 w-36 rounded-xl p-1.5">
          {OPTIONS.map((o) => {
            const Icon = o.icon;
            const active = o.value === theme;
            return (
              <button
                key={o.value}
                onClick={() => {
                  setTheme(o.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {o.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
