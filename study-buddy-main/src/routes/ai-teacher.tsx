import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Brain, Send, Loader2, Bot, User, Wand2, BookOpenCheck } from "lucide-react";
import { takeAiTutorContext, buildTutorPrompt, type AiTutorQuestionContext } from "@/lib/aiTutorContext";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_ACTIONS = [
  { label: "Explain this question", prompt: "Explain this MCQ question step by step: " },
  { label: "Make it easy", prompt: "Explain this in the simplest possible way: " },
  { label: "Shortcut trick", prompt: "Give me a shortcut/trick to solve: " },
  { label: "Similar example", prompt: "Give me a similar example with solution for: " },
  { label: "Practice question", prompt: "Create a practice MCQ (with 4 options and answer) on: " },
  { label: "Explain in Bangla", prompt: "বাংলায় সহজ ভাষায় ব্যাখ্যা করো: " },
];

export const Route = createFileRoute("/ai-teacher")({
  head: () => ({
    meta: [
      { title: "AI Tutor — MedhaRank" },
      {
        name: "description",
        content:
          "MedhaRank AI Tutor — your personal admission-prep teacher for Physics, Chemistry, Math, Biology, English & GK. Bangla and English supported.",
      },
      { property: "og:title", content: "AI Tutor — MedhaRank" },
      {
        property: "og:description",
        content: "Ask any admission question — get clear, exam-focused explanations in Bangla or English.",
      },
    ],
  }),
  component: AiTeacherPage,
});

function AiTeacherPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qContext, setQContext] = useState<AiTutorQuestionContext | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-send when arriving with a selected question context (from result page)
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const ctx = takeAiTutorContext();
    if (!ctx) return;
    setQContext(ctx);
    const prompt = buildTutorPrompt(ctx);
    void send(prompt, { restoreOnError: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send(text: string, opts?: { restoreOnError?: boolean }): Promise<boolean> {
    const trimmed = text.trim();
    if (!trimmed || loading) return false;
    setError(null);
    const userMsg: Message = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-teacher-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) {
        throw new Error("unavailable");
      }
      const data = (await res.json()) as { reply?: string };
      const reply = data.reply?.trim() ?? "";
      setMessages((m) => [...m, { role: "assistant", content: reply || "(no response)" }]);
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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl btn-gradient shadow-lg shadow-purple-500/30">
            <Brain className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">
              <span className="gradient-text">AI Tutor</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Your personal admission-prep teacher · Bangla & English
            </p>
          </div>
        </div>

        {/* Selected question context */}
        {qContext && (
          <div className="glass mb-4 flex items-start gap-3 rounded-2xl border border-[var(--brand-cyan)]/30 p-4">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--brand-cyan)]/15 text-[var(--brand-cyan)]">
              <BookOpenCheck className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--brand-cyan)]">Explaining selected question</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {qContext.subjectName ? `${qContext.subjectName} · ` : ""}
                {qContext.text.length > 120 ? qContext.text.slice(0, 120) + "…" : qContext.text}
              </p>
            </div>
          </div>
        )}

        {/* Chat card */}
        <div className="glass overflow-hidden rounded-3xl">
          {/* Messages */}
          <div
            ref={scrollRef}
            className="space-y-4 overflow-y-auto p-4 sm:p-6"
            style={{ minHeight: "55vh", maxHeight: "65vh" }}
          >
            {messages.length === 0 && !loading && (
              <EmptyState onPick={(p) => void send(p)} />
            )}

            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}

            {loading && (
              <div className="flex items-start gap-3">
                <Avatar role="assistant" />
                <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                  </span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="border-t border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Quick actions */}
          {messages.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-white/10 px-3 py-3 sm:px-4">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  disabled={loading}
                  onClick={() => setInput((v) => a.prompt + v)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  <Wand2 className="h-3 w-3" />
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Composer */}
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 border-t border-white/10 p-3 sm:p-4"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={1}
              placeholder="Ask anything — Physics, Chemistry, Math, Bio, English… (বাংলায়ও জিজ্ঞাসা করতে পারো)"
              disabled={loading}
              className="min-h-[44px] max-h-40 flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition-colors focus:border-white/20 focus:bg-white/10 disabled:opacity-50"
              aria-label="Your question"
            />
            <button
              type="submit"
              disabled={loading || input.trim().length === 0}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium btn-gradient btn-gradient-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="hidden sm:inline">{loading ? "Sending" : "Send"}</span>
            </button>
          </form>
        </div>
    </main>
  );
}

function Avatar({ role }: { role: "user" | "assistant" }) {
  if (role === "assistant") {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl btn-gradient shadow-md shadow-purple-500/30">
        <Bot className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5">
      <User className="h-4 w-4" />
    </span>
  );
}

function Bubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  if (role === "user") {
    return (
      <div className="flex items-start justify-end gap-3">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-tr-sm btn-gradient px-4 py-2.5 text-sm shadow-md shadow-purple-500/20">
          {content}
        </div>
        <Avatar role="user" />
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <Avatar role="assistant" />
      <div className="glass max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm">
        {content}
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  const starters = [
    "Explain Newton's third law with an example",
    "অম্ল-ক্ষারের পার্থক্য সহজ ভাষায় বুঝিয়ে দাও",
    "Quadratic equation solve করার shortcut trick দাও",
    "Photosynthesis-এর উপর একটা MCQ practice question বানাও",
  ];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 py-10 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl btn-gradient shadow-xl shadow-purple-500/40">
        <Brain className="h-8 w-8" />
      </div>
      <div>
        <h2 className="font-display text-xl font-semibold">Hello! I'm your AI Tutor 👋</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask me any admission question — I'll explain it clearly in Bangla or English.
        </p>
      </div>
      <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-2">
        {starters.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="glass rounded-xl px-4 py-3 text-left text-sm transition-transform hover:-translate-y-0.5 hover:bg-white/10"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
