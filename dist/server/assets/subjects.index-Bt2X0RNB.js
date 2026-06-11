import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { S as SUBJECTS } from "./router-DLih9N2T.js";
import "@tanstack/react-query";
import "react";
import "lucide-react";
function SubjectsPage() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold", children: "All Subjects" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-muted-foreground", children: "Pick a subject to view its chapters and start practicing." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3", children: SUBJECTS.map((s) => {
      const totalQ = s.chapters.reduce((a, c) => a + c.questions.length, 0);
      return /* @__PURE__ */ jsxs(Link, { to: "/subjects/$subject", params: {
        subject: s.slug
      }, className: "glass-glow glass-glow-hover group rounded-2xl p-6", children: [
        /* @__PURE__ */ jsx("div", { className: `mb-4 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br ${s.gradient} text-3xl`, children: s.icon }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: s.nameBn }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: s.name }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 flex gap-3 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            s.chapters.length,
            " chapters"
          ] }),
          /* @__PURE__ */ jsx("span", { children: "·" }),
          /* @__PURE__ */ jsxs("span", { children: [
            totalQ,
            " questions"
          ] })
        ] })
      ] }, s.slug);
    }) })
  ] });
}
export {
  SubjectsPage as component
};
