import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { g as getCurrentUser } from "./router-DLih9N2T.js";
import { u as usePracticeData, a as clearBookmarks, q as questionKey, b as removeBookmark } from "./practice-DYSfmWB4.js";
import { Eye, GraduationCap, Trash2, Bookmark, CheckCircle2, XCircle } from "lucide-react";
import "@tanstack/react-query";
function BookmarksPage() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!getCurrentUser()) navigate({
      to: "/login"
    });
  }, [navigate]);
  const {
    bookmarks
  } = usePracticeData();
  const [practice, setPractice] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "glass-strong rounded-3xl p-6 sm:p-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-400 text-2xl", children: "🔖" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold sm:text-3xl", children: "Bookmarked Questions" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
            bookmarks.length,
            " saved question",
            bookmarks.length === 1 ? "" : "s",
            "."
          ] })
        ] })
      ] }),
      bookmarks.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxs("button", { onClick: () => setPractice((p) => !p), className: "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm btn-gradient btn-gradient-hover", children: [
          practice ? /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(GraduationCap, { className: "h-4 w-4" }),
          practice ? "Show answers" : "Practice Bookmarked Questions"
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => clearBookmarks(), className: "inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-200 hover:bg-rose-500/20", children: [
          /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
          " Clear All Bookmarks"
        ] })
      ] })
    ] }) }),
    bookmarks.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl p-10 text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Bookmark, { className: "mx-auto mb-3 h-8 w-8 text-[var(--brand-cyan)]" }),
      "No bookmarks yet. Tap the bookmark icon beside any question to save it here.",
      /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(Link, { to: "/subjects", className: "text-[var(--brand-cyan)] hover:underline", children: "Browse subjects →" }) })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: bookmarks.map((q) => /* @__PURE__ */ jsx(BookmarkCard, { q, practice }, questionKey(q))) })
  ] });
}
function BookmarkCard({
  q,
  practice
}) {
  const key = questionKey(q);
  const [picked, setPicked] = useState(null);
  useEffect(() => {
    setPicked(null);
  }, [practice]);
  return /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-2 text-xs text-muted-foreground", children: [
      q.subjectName,
      " · ",
      q.chapterTitle
    ] }),
    /* @__PURE__ */ jsx("div", { className: "font-medium leading-relaxed", children: q.text }),
    /* @__PURE__ */ jsx("div", { className: "mt-3 grid gap-1.5", children: Object.entries(q.options).map(([k, v]) => {
      const isAnswer = k === q.correct;
      const isPicked = picked === k;
      let cls = "border-white/10 bg-white/5";
      if (practice) {
        if (picked) {
          if (isAnswer) cls = "border-emerald-500/50 bg-emerald-500/10";
          else if (isPicked) cls = "border-rose-500/50 bg-rose-500/10";
        } else {
          cls = "border-white/10 bg-white/5 hover:bg-white/10";
        }
      } else if (isAnswer) {
        cls = "border-emerald-500/50 bg-emerald-500/10";
      }
      const content = /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("span", { className: "font-semibold uppercase", children: [
          k,
          "."
        ] }),
        /* @__PURE__ */ jsx("span", { className: "flex-1", children: v }),
        !practice && isAnswer && /* @__PURE__ */ jsx("span", { className: "text-xs text-emerald-300", children: "Correct" }),
        practice && picked && isAnswer && /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-300" }),
        practice && isPicked && !isAnswer && /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4 text-rose-300" })
      ] });
      return practice && !picked ? /* @__PURE__ */ jsx("button", { onClick: () => setPicked(k), className: `flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm ${cls}`, children: content }, k) : /* @__PURE__ */ jsx("div", { className: `flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${cls}`, children: content }, k);
    }) }),
    q.explanation && (!practice || picked) && /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-xl border border-[var(--brand-cyan)]/30 bg-[var(--brand-cyan)]/10 p-3 text-sm leading-relaxed", children: [
      /* @__PURE__ */ jsx("span", { className: "font-semibold text-[var(--brand-cyan)]", children: "Explanation: " }),
      q.explanation
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxs("button", { onClick: () => removeBookmark(key), className: "inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground hover:bg-white/10 hover:text-white", children: [
      /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
      " Remove Bookmark"
    ] }) })
  ] });
}
export {
  BookmarksPage as component
};
