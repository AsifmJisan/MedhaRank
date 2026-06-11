import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Brain, BookOpenCheck, Loader2, Wand2, Send, Bot, User } from "lucide-react";
import { t as takeAiTutorContext, b as buildTutorPrompt } from "./aiTutorContext-hrvjCl4-.js";
const QUICK_ACTIONS = [{
  label: "Explain this question",
  prompt: "Explain this MCQ question step by step: "
}, {
  label: "Make it easy",
  prompt: "Explain this in the simplest possible way: "
}, {
  label: "Shortcut trick",
  prompt: "Give me a shortcut/trick to solve: "
}, {
  label: "Similar example",
  prompt: "Give me a similar example with solution for: "
}, {
  label: "Practice question",
  prompt: "Create a practice MCQ (with 4 options and answer) on: "
}, {
  label: "Explain in Bangla",
  prompt: "বাংলায় সহজ ভাষায় ব্যাখ্যা করো: "
}];
function AiTeacherPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qContext, setQContext] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, loading]);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const ctx = takeAiTutorContext();
    if (!ctx) return;
    setQContext(ctx);
    const prompt = buildTutorPrompt(ctx);
    void send(prompt, {
      restoreOnError: true
    });
  }, []);
  async function send(text, opts) {
    const trimmed = text.trim();
    if (!trimmed || loading) return false;
    setError(null);
    const userMsg = {
      role: "user",
      content: trimmed
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai-teacher-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: next
        })
      });
      if (!res.ok) {
        throw new Error("unavailable");
      }
      const data = await res.json();
      const reply = data.reply?.trim() ?? "";
      setMessages((m) => [...m, {
        role: "assistant",
        content: reply || "(no response)"
      }]);
      return true;
    } catch {
      setError("AI Tutor is temporarily unavailable. Please try again later.");
      if (opts?.restoreOnError) {
        setMessages((m) => m.filter((msg) => msg !== userMsg));
        setInput(trimmed);
      }
      return false;
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }
  function handleSubmit(e) {
    e.preventDefault();
    void send(input);
  }
  return /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-5xl px-4 py-8 sm:py-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "grid h-12 w-12 place-items-center rounded-2xl btn-gradient shadow-lg shadow-purple-500/30", children: /* @__PURE__ */ jsx(Brain, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "font-display text-2xl font-bold sm:text-3xl", children: /* @__PURE__ */ jsx("span", { className: "gradient-text", children: "AI Tutor" }) }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Your personal admission-prep teacher · Bangla & English" })
      ] })
    ] }),
    qContext && /* @__PURE__ */ jsxs("div", { className: "glass mb-4 flex items-start gap-3 rounded-2xl border border-[var(--brand-cyan)]/30 p-4", children: [
      /* @__PURE__ */ jsx("span", { className: "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--brand-cyan)]/15 text-[var(--brand-cyan)]", children: /* @__PURE__ */ jsx(BookOpenCheck, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-[var(--brand-cyan)]", children: "Explaining selected question" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-0.5 truncate text-xs text-muted-foreground", children: [
          qContext.subjectName ? `${qContext.subjectName} · ` : "",
          qContext.text.length > 120 ? qContext.text.slice(0, 120) + "…" : qContext.text
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass overflow-hidden rounded-3xl", children: [
      /* @__PURE__ */ jsxs("div", { ref: scrollRef, className: "space-y-4 overflow-y-auto p-4 sm:p-6", style: {
        minHeight: "55vh",
        maxHeight: "65vh"
      }, children: [
        messages.length === 0 && !loading && /* @__PURE__ */ jsx(EmptyState, { onPick: (p) => void send(p) }),
        messages.map((m, i) => /* @__PURE__ */ jsx(Bubble, { role: m.role, content: m.content }, i)),
        loading && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx(Avatar, { role: "assistant" }),
          /* @__PURE__ */ jsx("div", { className: "glass rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-muted-foreground", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
            " Thinking…"
          ] }) })
        ] })
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "border-t border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: error }),
      messages.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 border-t border-white/10 px-3 py-3 sm:px-4", children: QUICK_ACTIONS.map((a) => /* @__PURE__ */ jsxs("button", { type: "button", disabled: loading, onClick: () => setInput((v) => a.prompt + v), className: "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50", children: [
        /* @__PURE__ */ jsx(Wand2, { className: "h-3 w-3" }),
        a.label
      ] }, a.label)) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "flex items-end gap-2 border-t border-white/10 p-3 sm:p-4", children: [
        /* @__PURE__ */ jsx("textarea", { ref: inputRef, value: input, onChange: (e) => setInput(e.target.value), onKeyDown: (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void send(input);
          }
        }, rows: 1, placeholder: "Ask anything — Physics, Chemistry, Math, Bio, English… (বাংলায়ও জিজ্ঞাসা করতে পারো)", disabled: loading, className: "min-h-[44px] max-h-40 flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition-colors focus:border-white/20 focus:bg-white/10 disabled:opacity-50", "aria-label": "Your question" }),
        /* @__PURE__ */ jsxs("button", { type: "submit", disabled: loading || input.trim().length === 0, className: "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium btn-gradient btn-gradient-hover disabled:opacity-50 disabled:cursor-not-allowed", children: [
          loading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: loading ? "Sending" : "Send" })
        ] })
      ] })
    ] })
  ] });
}
function Avatar({
  role
}) {
  if (role === "assistant") {
    return /* @__PURE__ */ jsx("span", { className: "grid h-8 w-8 shrink-0 place-items-center rounded-xl btn-gradient shadow-md shadow-purple-500/30", children: /* @__PURE__ */ jsx(Bot, { className: "h-4 w-4" }) });
  }
  return /* @__PURE__ */ jsx("span", { className: "grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5", children: /* @__PURE__ */ jsx(User, { className: "h-4 w-4" }) });
}
function Bubble({
  role,
  content
}) {
  if (role === "user") {
    return /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-end gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-tr-sm btn-gradient px-4 py-2.5 text-sm shadow-md shadow-purple-500/20", children: content }),
      /* @__PURE__ */ jsx(Avatar, { role: "user" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsx(Avatar, { role: "assistant" }),
    /* @__PURE__ */ jsx("div", { className: "glass max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm", children: content })
  ] });
}
function EmptyState({
  onPick
}) {
  const starters = ["Explain Newton's third law with an example", "অম্ল-ক্ষারের পার্থক্য সহজ ভাষায় বুঝিয়ে দাও", "Quadratic equation solve করার shortcut trick দাও", "Photosynthesis-এর উপর একটা MCQ practice question বানাও"];
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col items-center justify-center gap-6 py-10 text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "grid h-16 w-16 place-items-center rounded-2xl btn-gradient shadow-xl shadow-purple-500/40", children: /* @__PURE__ */ jsx(Brain, { className: "h-8 w-8" }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display text-xl font-semibold", children: "Hello! I'm your AI Tutor 👋" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Ask me any admission question — I'll explain it clearly in Bangla or English." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid w-full max-w-2xl gap-2 sm:grid-cols-2", children: starters.map((s) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => onPick(s), className: "glass rounded-xl px-4 py-3 text-left text-sm transition-transform hover:-translate-y-0.5 hover:bg-white/10", children: s }, s)) })
  ] });
}
export {
  AiTeacherPage as component
};
