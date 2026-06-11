import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { e as Route, s as slugifyChapter } from "./router-DLih9N2T.js";
import { ArrowLeft, Play } from "lucide-react";
import "@tanstack/react-query";
import "react";
function ChapterListPage() {
  const {
    subject
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Link, { to: "/subjects", className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white", children: [
      /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
      " All subjects"
    ] }),
    /* @__PURE__ */ jsx("div", { className: "glass-strong rounded-3xl p-8", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: `grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${subject.gradient} text-4xl`, children: subject.icon }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: subject.nameBn }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold", children: subject.name }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
          subject.chapters.length,
          " chapters available"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: subject.chapters.map((c, i) => /* @__PURE__ */ jsx(Link, { to: "/exam/$subject/$chapter", params: {
      subject: subject.slug,
      chapter: slugifyChapter(c.title)
    }, className: "glass-glow glass-glow-hover group rounded-2xl p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
          "Chapter ",
          i + 1
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "font-display text-lg font-semibold leading-snug", children: c.title }),
        c.description && /* @__PURE__ */ jsx("p", { className: "mt-1 line-clamp-2 text-sm text-muted-foreground", children: c.description }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 text-xs text-muted-foreground", children: [
          c.questions.length,
          " questions"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl btn-gradient transition group-hover:scale-110", children: /* @__PURE__ */ jsx(Play, { className: "h-4 w-4" }) })
    ] }) }, i)) })
  ] });
}
export {
  ChapterListPage as component
};
