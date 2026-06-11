import { useState, useEffect } from "react";
const WRONG_KEY = "medhrank.wrongQuestions";
const BOOKMARK_KEY = "medhrank.bookmarks";
function read(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, val) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
  window.dispatchEvent(new Event("practice-change"));
}
function questionKey(q) {
  return `${q.subjectSlug}::${q.chapterTitle}::${q.text}`;
}
function getWrongQuestions() {
  return read(WRONG_KEY, []);
}
function saveWrongQuestion(q) {
  const all = getWrongQuestions();
  const key = questionKey(q);
  if (all.some((x) => questionKey(x) === key)) return;
  all.push(q);
  write(WRONG_KEY, all);
}
function removeWrongQuestion(key) {
  write(
    WRONG_KEY,
    getWrongQuestions().filter((x) => questionKey(x) !== key)
  );
}
function clearWrongQuestions() {
  write(WRONG_KEY, []);
}
function getBookmarks() {
  return read(BOOKMARK_KEY, []);
}
function isBookmarked(key) {
  return getBookmarks().some((x) => questionKey(x) === key);
}
function removeBookmark(key) {
  write(
    BOOKMARK_KEY,
    getBookmarks().filter((x) => questionKey(x) !== key)
  );
}
function clearBookmarks() {
  write(BOOKMARK_KEY, []);
}
function toggleBookmark(q) {
  const all = getBookmarks();
  const key = questionKey(q);
  if (all.some((x) => questionKey(x) === key)) {
    write(
      BOOKMARK_KEY,
      all.filter((x) => questionKey(x) !== key)
    );
    return false;
  }
  all.push(q);
  write(BOOKMARK_KEY, all);
  return true;
}
function useBookmarked(key) {
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
function usePracticeData() {
  const [wrong, setWrong] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
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
export {
  clearBookmarks as a,
  removeBookmark as b,
  clearWrongQuestions as c,
  useBookmarked as d,
  questionKey as q,
  removeWrongQuestion as r,
  saveWrongQuestion as s,
  toggleBookmark as t,
  usePracticeData as u
};
