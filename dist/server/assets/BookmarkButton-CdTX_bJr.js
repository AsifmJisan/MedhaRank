import { jsx } from "react/jsx-runtime";
import { Bookmark } from "lucide-react";
import { q as questionKey, d as useBookmarked, t as toggleBookmark } from "./practice-DYSfmWB4.js";
function BookmarkButton({
  question,
  className = ""
}) {
  const key = questionKey(question);
  const active = useBookmarked(key);
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark({ ...question, timestamp: Date.now() });
      },
      "aria-pressed": active,
      "aria-label": active ? "Remove bookmark" : "Bookmark question",
      title: active ? "Remove bookmark" : "Bookmark question",
      className: `grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition ${active ? "border-[var(--brand-cyan)] bg-[var(--brand-cyan)]/15 text-[var(--brand-cyan)]" : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"} ${className}`,
      children: /* @__PURE__ */ jsx(Bookmark, { className: "h-4 w-4", fill: active ? "currentColor" : "none" })
    }
  );
}
export {
  BookmarkButton as B
};
