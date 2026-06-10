import { Bookmark } from "lucide-react";
import { toggleBookmark, useBookmarked, questionKey, type SavedQuestion } from "@/lib/practice";

// Star/bookmark toggle shown beside a question. Reuses existing design tokens.
export function BookmarkButton({
  question,
  className = "",
}: {
  question: Omit<SavedQuestion, "timestamp">;
  className?: string;
}) {
  const key = questionKey(question);
  const active = useBookmarked(key);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark({ ...question, timestamp: Date.now() });
      }}
      aria-pressed={active}
      aria-label={active ? "Remove bookmark" : "Bookmark question"}
      title={active ? "Remove bookmark" : "Bookmark question"}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition ${
        active
          ? "border-[var(--brand-cyan)] bg-[var(--brand-cyan)]/15 text-[var(--brand-cyan)]"
          : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
      } ${className}`}
    >
      <Bookmark className="h-4 w-4" fill={active ? "currentColor" : "none"} />
    </button>
  );
}
