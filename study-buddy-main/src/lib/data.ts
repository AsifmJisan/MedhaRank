import Chemistry from "@/data/Chemistry.json";
import Physics from "@/data/Physics.json";
import Math from "@/data/Math.json";
import DhakaUniversity from "@/data/Dhaka University.json";
import MedicalQuestions from "@/data/Medical Questions.json";
import RajshahiUniversity from "@/data/RajshahiUniversity.json"
export type Question = {
  text: string;
  options: Record<string, string>;
  correct: string;
  explanation?: string;
};
export type Chapter = {
  title: string;
  description?: string;
  questions: Question[];
};
export type Subject = {
  slug: string;
  name: string;
  nameBn?: string;
  icon: string;
  gradient: string;
  chapters: Chapter[];
};

function normalizeQuestions(raw: unknown): Question[] {
  const out: Question[] = [];
  const walk = (item: unknown) => {
    if (Array.isArray(item)) { item.forEach(walk); return; }
    if (item && typeof item === "object") {
      const q = item as Partial<Question>;
      if (q.text && q.options && typeof q.options === "object" && q.correct) {
        out.push({ text: q.text, options: q.options, correct: q.correct, explanation: q.explanation });
      }
    }
  };
  walk(raw);
  return out;
}
function normalizeChapters(raw: unknown[]): Chapter[] {
  return (raw as Array<Partial<Chapter> & { questions?: unknown }>).map((c) => ({
    title: c.title ?? "Untitled",
    description: c.description,
    questions: normalizeQuestions(c.questions ?? []),
  }));
}

export const SUBJECTS: Subject[] = [
  { slug: "physics", name: "Physics", nameBn: "পদার্থবিজ্ঞান", icon: "⚛️", gradient: "from-blue-500 to-cyan-400", chapters: normalizeChapters(Physics) },
  { slug: "chemistry", name: "Chemistry", nameBn: "রসায়ন", icon: "🧪", gradient: "from-emerald-500 to-teal-400", chapters: normalizeChapters(Chemistry) },
  { slug: "math", name: "Math", nameBn: "গণিত", icon: "📐", gradient: "from-purple-500 to-pink-400", chapters: normalizeChapters(Math) },
  { slug: "medical", name: "Medical Questions", nameBn: "মেডিকেল প্রশ্নব্যাংক", icon: "🩺", gradient: "from-rose-500 to-orange-400", chapters: normalizeChapters(MedicalQuestions) },
  { slug: "dhaka-university", name: "Dhaka University", nameBn: "ঢাকা বিশ্ববিদ্যালয়", icon: "🎓", gradient: "from-indigo-500 to-violet-400", chapters: normalizeChapters(DhakaUniversity) },
  { slug: "RU",name: "Rajshahi University",nameBn: "রাজশাহী বিশ্ববিদ্যালয়",icon: "🎓",gradient: "from-green-500 to-emerald-400",chapters: normalizeChapters(RajshahiUniversity)},
];

export function getSubject(slug: string) {
  return SUBJECTS.find((s) => s.slug === slug);
}
export function slugifyChapter(title: string) {
  return encodeURIComponent(title.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 80));
}
export function findChapter(subjectSlug: string, chapterSlug: string) {
  const subj = getSubject(subjectSlug);
  if (!subj) return null;
  const chapter = subj.chapters.find((c) => slugifyChapter(c.title) === chapterSlug);
  return chapter ? { subject: subj, chapter } : null;
}
