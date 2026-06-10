import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "exam.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    # Existing tables (subjects, chapters, questions, users, scores, live_exam_scores, wrong_answers, ai_generated_questions)
    # ... (omitted for brevity) ...
    # Add is_admin column to users if not exists
    try:
        conn.execute("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0")
    except Exception:
        pass
    # Create docs_settings table
    try:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS docs_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                is_visible INTEGER DEFAULT 0,
                start_datetime TEXT,
                end_datetime TEXT,
                override_enabled INTEGER DEFAULT 0
            )
        ''')
    except Exception:
        pass
    # Ensure docs_content and docs_team tables exist (already added earlier)
    conn.commit()
    conn.close()

def migrate_db():
    conn = get_db()
    # Existing migrations (users columns, etc.)
    # Ensure is_admin column exists (already handled in init_db)
    # Ensure docs_settings table exists (already handled in init_db)
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
