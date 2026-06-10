# seed.py
"""
seed.py
-------
Populates the database with subjects, chapters, and questions
by reading all .json files in the 'data' directory.
Run once: `python seed.py`
"""

import json
import os
import glob
import re
from database import init_db, get_db

def sanitize_filename(name):
    return re.sub(r'[\\/*?:"<>|]', "", name).strip()


def seed():
    # Initialise DB and clear existing data
    init_db()
    conn = get_db()
    cur = conn.cursor()

    # Clear tables
    cur.execute("DELETE FROM questions")
    cur.execute("DELETE FROM chapters")
    cur.execute("DELETE FROM subjects")
    cur.execute("DELETE FROM sqlite_sequence WHERE name IN ('subjects', 'chapters', 'questions')")

    # Process each JSON file in the data/ directory
    data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
    json_files = glob.glob(os.path.join(data_dir, "*.json"))

    if not json_files:
        print(f"No .json files found in {data_dir}")
        conn.close()
        return

    for file_path in json_files:
        filename = os.path.basename(file_path)
        subject_name = os.path.splitext(filename)[0].capitalize()

        print(f"Seeding subject: {subject_name} from {filename}")

        # Insert subject
        cur.execute("INSERT INTO subjects (name) VALUES (?)", (subject_name,))
        subject_id = cur.lastrowid

        # Load JSON data
        with open(file_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                print(f"Error reading JSON from {filename}. Skipping.")
                continue

        # Treat each top-level entry as a chapter
        for chapter in data:
            desc = chapter.get("description", "")
            if isinstance(desc, list):
                desc = "\n".join(str(d) for d in desc)
                
            cur.execute(
                "INSERT INTO chapters (subject_id, title, description) VALUES (?, ?, ?)",
                (subject_id, chapter.get("title"), desc),
            )
            chapter_id = cur.lastrowid
            
            # Generate notes directory for this chapter
            chapter_title_sanitized = sanitize_filename(chapter.get("title", f"Chapter_{chapter_id}"))
            subject_name_sanitized = sanitize_filename(subject_name)
            notes_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "notes", subject_name_sanitized, chapter_title_sanitized)
            os.makedirs(notes_dir, exist_ok=True)

            
            raw_questions = chapter.get("questions", [])
            questions_to_process = []
            for q in raw_questions:
                if isinstance(q, list):
                    questions_to_process.extend(q)
                else:
                    questions_to_process.append(q)
                    
            for q in questions_to_process:
                if not isinstance(q, dict):
                    continue
                opts = q.get("options", {})
                if not isinstance(opts, dict):
                    opts = {}
                # Get correct option, default to 'a' if not present or invalid
                correct = q.get("correct", "a")
                if not isinstance(correct, str):
                    correct = str(correct)
                correct = correct.lower()
                if correct not in ['a', 'b', 'c', 'd']:
                    correct = 'a'
                    
                cur.execute(
                    """INSERT INTO questions
                    (chapter_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        chapter_id,
                        q.get("text", ""),
                        opts.get("a", ""),
                        opts.get("b", ""),
                        opts.get("c", ""),
                        opts.get("d", ""),
                        correct,
                        q.get("explanation", ""),
                    ),
                )

    conn.commit()
    conn.close()
    print("Database seeded from JSON files.")

if __name__ == "__main__":
    seed()
