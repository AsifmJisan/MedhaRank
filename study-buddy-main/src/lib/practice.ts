// Wrong Answer Practice + Bookmark Questions storage helpers (localStorage)
import { useEffect, useState } from "react";

const WRONG_KEY = "medhrank.wrongQuestions";
const BOOKMARK_KEY = "medhrank.bookmarks";

export type SavedQuestion = {
  subjectSlug: string;
  subjectName: string;
  chapterTitle: string;
  text: string;
  options: Record<string, string>;
  correct: string;
  explanation?: string;
  timestamp: number;
};

export type WrongQuestion = SavedQuestion & {
  selected: string | null;
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, val: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
  window.dispatchEvent(new Event("practice-change"));
}

// Unique identity for a question regardless of subject metadata wording.
export function questionKey(q: { subjectSlug: string; chapterTitle: string; text: string }) {
  return `${q.subjectSlug}::${q.chapterTitle}::${q.text}`;
}

/* ----------------------------- Wrong Answers ----------------------------- */

export function getWrongQuestions(): WrongQuestion[] {
  return read<WrongQuestion[]>(WRONG_KEY, []);
}

export function saveWrongQuestion(q: WrongQuestion) {
  const all = getWrongQuestions();
  const key = questionKey(q);
  if (all.some((x) => questionKey(x) === key)) return; // no duplicates
  all.push(q);
  write(WRONG_KEY, all);
}

export function removeWrongQuestion(key: string) {
  write(
    WRONG_KEY,
    getWrongQuestions().filter((x) => questionKey(x) !== key),
  );
}

export function clearWrongQuestions() {
  write(WRONG_KEY, []);
}

/* ------------------------------- Bookmarks ------------------------------- */

export function getBookmarks(): SavedQuestion[] {
  return read<SavedQuestion[]>(BOOKMARK_KEY, []);
}

export function isBookmarked(key: string): boolean {
  return getBookmarks().some((x) => questionKey(x) === key);
}

export function removeBookmark(key: string) {
  write(
    BOOKMARK_KEY,
    getBookmarks().filter((x) => questionKey(x) !== key),
  );
}

export function clearBookmarks() {
  write(BOOKMARK_KEY, []);
}

// Add if missing, remove if present. Returns the new bookmarked state.
export function toggleBookmark(q: SavedQuestion): boolean {
  const all = getBookmarks();
  const key = questionKey(q);
  if (all.some((x) => questionKey(x) === key)) {
    write(
      BOOKMARK_KEY,
      all.filter((x) => questionKey(x) !== key),
    );
    return false;
  }
  all.push(q);
  write(BOOKMARK_KEY, all);
  return true;
}

/* --------------------------------- Hooks --------------------------------- */

// Reactive bookmarked-state for a single question.
export function useBookmarked(key: string): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const sync = () => setOn(isBookmarked(key));
    sync();
    window.addEventListener("practice-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("practice-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [key]);
  return on;
}

// Reactive list reader for the practice pages.
export function usePracticeData() {
  const [wrong, setWrong] = useState<WrongQuestion[]>([]);
  const [bookmarks, setBookmarks] = useState<SavedQuestion[]>([]);
  useEffect(() => {
    const sync = () => {
      setWrong(getWrongQuestions());
      setBookmarks(getBookmarks());
    };
    sync();
    window.addEventListener("practice-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("practice-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return { wrong, bookmarks };
}
