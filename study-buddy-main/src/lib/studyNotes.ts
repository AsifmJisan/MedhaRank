import biology1st from "@/data/biology_1st.json";
import biology2nd from "@/data/biology.json";
import physics1st from "@/data/physics_1st.json";
export type StudyTopic = { TopicName?: string; Explanation?: string };
export type StudyEntry = { Title?: string; Chapter?: string; Topic?: StudyTopic[] };

export type StudyChapter = { Chapter?: string; Topic?: StudyTopic[] };

export type StudySet = {
  slug: string;
  icon: string;
  gradient: string;
  data: StudyEntry[];
};

export const STUDY_SETS: StudySet[] = [
  { slug: "biology-1st", icon: "🧬", gradient: "from-green-500 to-lime-400", data: biology1st as StudyEntry[] },
  { slug: "biology-2nd", icon: "🧬", gradient: "from-emerald-500 to-teal-400", data: biology2nd as StudyEntry[] },
  { slug: "physics-1st", icon: "🪐", gradient: "from-blue-500 to-cyan-400", data: physics1st as StudyEntry[] },
];

export function parseStudySet(set: StudySet) {
  const entries = Array.isArray(set.data) ? set.data : [];
  const title = entries.find((e) => typeof e?.Title === "string" && e.Title.trim())?.Title ?? null;
  const chapters = entries.filter(
    (e) => typeof e?.Chapter === "string" && Array.isArray(e?.Topic)
  ) as StudyChapter[];
  const topicCount = chapters.reduce((a, c) => a + (c.Topic?.length ?? 0), 0);
  return { title, chapters, chapterCount: chapters.length, topicCount };
}

export function getStudySet(slug: string) {
  return STUDY_SETS.find((s) => s.slug === slug);
}
