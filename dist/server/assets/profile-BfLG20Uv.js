import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { g as getCurrentUser, c as getResults, l as logout, u as updateUser } from "./router-DLih9N2T.js";
import "@tanstack/react-query";
import "lucide-react";
function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getCurrentUser());
  const [name, setName] = useState(user?.name ?? "");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!user) navigate({
      to: "/login"
    });
  }, [user, navigate]);
  if (!user) return null;
  const myResults = getResults().filter((r) => r.userId === user.id);
  const totalExams = myResults.length;
  const avg = totalExams ? Math.round(myResults.reduce((a, r) => a + r.score, 0) / totalExams) : 0;
  const best = myResults.reduce((a, r) => Math.max(a, r.score), 0);
  const save = () => {
    updateUser({
      name
    });
    setUser(getCurrentUser());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "glass-strong rounded-3xl p-8", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-5", children: [
      /* @__PURE__ */ jsx("div", { className: "grid h-20 w-20 place-items-center rounded-2xl btn-gradient text-3xl font-bold", children: user.name.charAt(0).toUpperCase() }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: user.name }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: user.email }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Joined ",
          new Date(user.createdAt).toLocaleDateString()
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsx(Stat, { label: "Exams", value: totalExams }),
      /* @__PURE__ */ jsx(Stat, { label: "Best score", value: `${best}%` }),
      /* @__PURE__ */ jsx(Stat, { label: "Average", value: `${avg}%` })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Edit profile" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-3", children: [
        /* @__PURE__ */ jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsx("span", { className: "mb-1 block text-xs text-muted-foreground", children: "Display name" }),
          /* @__PURE__ */ jsx("input", { value: name, onChange: (e) => setName(e.target.value), className: "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-[var(--brand-cyan)]" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("button", { onClick: save, className: "rounded-xl px-5 py-2.5 btn-gradient btn-gradient-hover", children: "Save changes" }),
          saved && /* @__PURE__ */ jsx("span", { className: "text-sm text-emerald-400", children: "Saved!" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("button", { onClick: () => {
      logout();
      navigate({
        to: "/"
      });
    }, className: "w-full rounded-xl border border-rose-500/40 bg-rose-500/10 px-5 py-2.5 text-rose-300 hover:bg-rose-500/20", children: "Sign out" })
  ] });
}
function Stat({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl p-5 text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("div", { className: "mt-1 text-2xl font-bold gradient-text", children: value })
  ] });
}
export {
  ProfilePage as component
};
