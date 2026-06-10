// Mock localStorage auth for MedhaRank
import { useEffect, useState } from "react";

const USERS_KEY = "medhrank.users";
const SESSION_KEY = "medhrank.session";
const RESULTS_KEY = "medhrank.results";
const LAST_RESULT_KEY = "medhrank.lastResult";

export type User = { id: string; name: string; email: string; password: string; createdAt: number; avatar?: string };
export type ExamResult = {
  id: string;
  userId: string;
  userName: string;
  subjectSlug: string;
  subjectName: string;
  chapterTitle: string;
  total: number;
  correct: number;
  wrong: number;
  score: number; // percentage based on final score with negative marking
  durationSec: number;
  answers: { qIndex: number; selected: string | null; correct: string }[];
  questions: { text: string; options: Record<string, string>; correct: string; explanation?: string }[];
  createdAt: number;
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) || "") as T; } catch { return fallback; }
}
function write(key: string, val: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
}

export function getUsers(): User[] { return read<User[]>(USERS_KEY, []); }
export function saveUsers(u: User[]) { write(USERS_KEY, u); }

export function getCurrentUser(): User | null {
  const id = read<string | null>(SESSION_KEY, null);
  if (!id) return null;
  return getUsers().find((u) => u.id === id) ?? null;
}

export function login(email: string, password: string): User {
  const u = getUsers().find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
  if (!u) throw new Error("Invalid email or password");
  write(SESSION_KEY, u.id);
  window.dispatchEvent(new Event("auth-change"));
  return u;
}

export function register(name: string, email: string, password: string): User {
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) throw new Error("Email already in use");
  const user: User = { id: crypto.randomUUID(), name, email, password, createdAt: Date.now() };
  users.push(user);
  saveUsers(users);
  write(SESSION_KEY, user.id);
  window.dispatchEvent(new Event("auth-change"));
  return user;
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("auth-change"));
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    setUser(getCurrentUser());
    const onChange = () => setUser(getCurrentUser());
    window.addEventListener("auth-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("auth-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return user;
}

export function getResults(): ExamResult[] { return read<ExamResult[]>(RESULTS_KEY, []); }
export function saveResult(r: ExamResult) {
  const all = getResults();
  all.push(r);
  write(RESULTS_KEY, all);
  write(LAST_RESULT_KEY, r);
}
export function getLastResult(): ExamResult | null { return read<ExamResult | null>(LAST_RESULT_KEY, null); }
export function updateUser(patch: Partial<User>) {
  const u = getCurrentUser();
  if (!u) return;
  const users = getUsers().map((x) => (x.id === u.id ? { ...x, ...patch } : x));
  saveUsers(users);
  window.dispatchEvent(new Event("auth-change"));
}
