"""
app.py
------
Flask application for the Student Exam Practice site.
Routes:
    GET  /                   — Dashboard (if logged in) or Home page
    GET  /subjects           — Home page (list all subjects)
    GET  /subject/<int:subject_id>          — List chapters for a subject
    GET  /subject/<int:subject_id>/chapter/<int:chapter_id> — Show exam for a chapter (all or random)
    POST /subject/<int:subject_id>/chapter/<int:chapter_id>/submit   — Score the attempt and show results
    GET  /profile            — Edit profile
    POST /profile            — Save profile
    POST /profile/upload-pic — Upload profile picture
    POST /delete-account     — Delete user account
    GET  /api/stats          — JSON stats for charts
"""

import os
import json
import uuid
import urllib.request
import random
from datetime import datetime, timedelta
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import re
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

# Load local .env file if it exists
load_dotenv()

# This works seamlessly both locally and on Render
database_url = os.environ.get("DATABASE_URL")

# ── Live Exam Config ────────────────────────────────────────────────
LIVE_EXAM_DURATION_MINS = 60
DAILY_EXAM_START_HOUR = 20  # 7:00 PM local time
WEEKLY_EXAM_DAY = 4         # Friday (0=Mon, 6=Sun)
WEEKLY_EXAM_START_HOUR = 20 # 8:00 PM local time

def get_live_exam_status(exam_type):
    now = datetime.now()
    if exam_type == 'daily':
        start_time = now.replace(hour=DAILY_EXAM_START_HOUR, minute=0, second=0, microsecond=0)
        end_time = start_time + timedelta(minutes=LIVE_EXAM_DURATION_MINS)
        if now > end_time:
            start_time += timedelta(days=1)
            end_time = start_time + timedelta(minutes=LIVE_EXAM_DURATION_MINS)
    else: # weekly
        start_time = now.replace(hour=WEEKLY_EXAM_START_HOUR, minute=0, second=0, microsecond=0)
        days_ahead = WEEKLY_EXAM_DAY - start_time.weekday()
        if days_ahead < 0:
            days_ahead += 7
        start_time += timedelta(days=days_ahead)
        end_time = start_time + timedelta(minutes=LIVE_EXAM_DURATION_MINS)
        if days_ahead == 0 and now > end_time:
            start_time += timedelta(days=7)
            end_time = start_time + timedelta(minutes=LIVE_EXAM_DURATION_MINS)

    is_active = start_time <= now <= end_time
    seconds_remaining = 0
    if is_active:
        seconds_remaining = int((end_time - now).total_seconds())
    
    date_str = start_time.strftime("%Y-%m-%d")

    return {
        "start_time": start_time,
        "end_time": end_time,
        "is_active": is_active,
        "seconds_remaining": seconds_remaining,
        "date_str": date_str
    }

app = Flask(__name__)
app.secret_key = 'your_super_secret_key_here'

# Upload config
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Subject(db.Model):
    __tablename__ = 'subjects'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, nullable=False, unique=True)

class Chapter(db.Model):
    __tablename__ = 'chapters'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False)
    title = db.Column(db.String, nullable=False)
    description = db.Column(db.Text)

class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapters.id'), nullable=False)
    question_text = db.Column(db.String, nullable=False)
    option_a = db.Column(db.String, nullable=False)
    option_b = db.Column(db.String, nullable=False)
    option_c = db.Column(db.String, nullable=False)
    option_d = db.Column(db.String, nullable=False)
    correct_option = db.Column(db.String, nullable=False)
    explanation = db.Column(db.Text)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String, nullable=False, unique=True)
    password_hash = db.Column(db.String, nullable=False)
    display_name = db.Column(db.String, default='')
    bio = db.Column(db.Text, default='')
    college = db.Column(db.String, default='')
    year = db.Column(db.String, default='')
    profile_pic = db.Column(db.String, default='')
    goal = db.Column(db.Text, default='')
    is_admin = db.Column(db.Integer, default=0)

class Score(db.Model):
    __tablename__ = 'scores'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False)
    chapter_id = db.Column(db.Integer, nullable=False)
    score = db.Column(db.Integer, nullable=False)
    total = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.current_timestamp())

class LiveExamScore(db.Model):
    __tablename__ = 'live_exam_scores'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    exam_type = db.Column(db.String, nullable=False)
    date_str = db.Column(db.String, nullable=False)
    score = db.Column(db.Integer, nullable=False)
    total = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.current_timestamp())

class WrongAnswer(db.Model):
    __tablename__ = 'wrong_answers'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.current_timestamp())

class AiGeneratedQuestion(db.Model):
    __tablename__ = 'ai_generated_questions'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    original_question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    question_text = db.Column(db.String, nullable=False)
    option_a = db.Column(db.String, nullable=False)
    option_b = db.Column(db.String, nullable=False)
    option_c = db.Column(db.String, nullable=False)
    option_d = db.Column(db.String, nullable=False)
    correct_option = db.Column(db.String, nullable=False)
    explanation = db.Column(db.Text)

class DocsSettings(db.Model):
    __tablename__ = 'docs_settings'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    is_visible = db.Column(db.Integer, default=0)
    publish_start = db.Column(db.DateTime)
    publish_end = db.Column(db.DateTime)

class DocsContent(db.Model):
    __tablename__ = 'docs_content'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    section_name = db.Column(db.String, nullable=False)
    markdown = db.Column(db.Text, nullable=False)
    display_order = db.Column(db.Integer, default=0)
    version = db.Column(db.Integer, default=1)

class DocsTeam(db.Model):
    __tablename__ = 'docs_team'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, nullable=False)
    role = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    avatar_path = db.Column(db.String, default='')

with app.app_context():
    db.create_all()

class RowWrapper:
    def __init__(self, row, mapping):
        self._row = row
        self._mapping = mapping
    def __getitem__(self, key):
        if isinstance(key, int):
            return self._row[key]
        return self._mapping[key]
    def __contains__(self, key):
        return key in self._mapping
    def keys(self):
        return self._mapping.keys()

class DBProxy:
    def execute(self, query, params=()):
        from sqlalchemy import text
        param_dict = {}
        for i, p in enumerate(params):
            param_dict[f'p{i}'] = p
        
        def replace_qmark(match, counter=[0]):
            name = f":p{counter[0]}"
            counter[0] += 1
            return name
            
        query_replaced = re.sub(r'\?', replace_qmark, query)
        result = db.session.execute(text(query_replaced), param_dict)
        
        class ResultWrapper:
            def __init__(self, res):
                self.rows = res.fetchall() if res.returns_rows else []
            def fetchone(self):
                if not self.rows: return None
                return RowWrapper(self.rows[0], self.rows[0]._mapping)
            def fetchall(self):
                return [RowWrapper(r, r._mapping) for r in self.rows]
        return ResultWrapper(result)
        
    def commit(self):
        db.session.commit()
        
    def close(self):
        pass

def get_db():
    return DBProxy()


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_user_profile():
    """Fetch the current logged-in user's profile, or None."""
    user_id = session.get('user_id')
    if not user_id:
        return None
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return user


def calculate_level(total_xp):
    """
    Leveling system:
    Level 1: 0 XP
    Level 2: 100 XP
    Level 3: 250 XP
    Each level requires progressively more XP.
    """
    levels = [
        (1, 0, "Beginner"),
        (2, 100, "Novice"),
        (3, 250, "Learner"),
        (4, 500, "Apprentice"),
        (5, 850, "Scholar"),
        (6, 1300, "Expert"),
        (7, 1900, "Master"),
        (8, 2700, "Grandmaster"),
        (9, 3800, "Legend"),
        (10, 5200, "Champion"),
    ]
    current_level = levels[0]
    next_level = levels[1] if len(levels) > 1 else None
    for i, lvl in enumerate(levels):
        if total_xp >= lvl[1]:
            current_level = lvl
            next_level = levels[i + 1] if i + 1 < len(levels) else None
        else:
            break

    xp_for_current = current_level[1]
    xp_for_next = next_level[1] if next_level else current_level[1]
    progress = 0
    if next_level:
        progress = ((total_xp - xp_for_current) / (xp_for_next - xp_for_current)) * 100
    else:
        progress = 100  # Max level

    return {
        "level": current_level[0],
        "title": current_level[2],
        "total_xp": total_xp,
        "xp_for_next": xp_for_next,
        "xp_for_current": xp_for_current,
        "progress": min(progress, 100),
        "is_max": next_level is None,
    }


def compute_xp(score, total):
    """Award XP: 10 per correct answer + bonus for high percentage."""
    if total == 0:
        return 0
    xp = score * 10
    pct = score / total * 100
    if pct >= 90:
        xp += 50
    elif pct >= 70:
        xp += 25
    elif pct >= 50:
        xp += 10
    return xp


@app.context_processor
def inject_user():
    """Make user profile available in all templates."""
    user = get_user_profile()
    return dict(current_user=user)


# ── Home / Landing ──────────────────────────────────────────────────
@app.route('/')
def home():
    if session.get('user_id'):
        return redirect(url_for('dashboard'))
    conn = get_db()
    subjects = conn.execute("SELECT * FROM subjects").fetchall()
    total_q = conn.execute("SELECT COUNT(*) FROM questions").fetchone()[0]
    conn.close()
    return render_template('home.html', subjects=subjects, total_questions=total_q)


@app.route('/subjects')
def subjects_page():
    conn = get_db()
    subjects = conn.execute("SELECT * FROM subjects").fetchall()
    total_q = conn.execute("SELECT COUNT(*) FROM questions").fetchone()[0]
    conn.close()
    return render_template('home.html', subjects=subjects, total_questions=total_q)


@app.route('/hall-of-fame')
def hall_of_fame():
    return render_template('hall_of_fame.html')


# ── List chapters for a subject ──────────────────────────────────────
@app.route('/subject/<int:subject_id>')
def subject_view(subject_id):
    conn = get_db()
    subject = conn.execute("SELECT * FROM subjects WHERE id = ?", (subject_id,)).fetchone()
    if subject is None:
        conn.close()
        return "Subject not found.", 404
    chapters = conn.execute(
        "SELECT * FROM chapters WHERE subject_id = ?", (subject_id,)
    ).fetchall()
    conn.close()
    return render_template('subject.html', subject=subject, chapters=chapters)


# ── Show exam for a chapter ──────────────────────────────────────
@app.route('/subject/<int:subject_id>/chapter/<int:chapter_id>')
def chapter_exam(subject_id, chapter_id):
    conn = get_db()
    # Verify subject and chapter belong together
    chapter = conn.execute(
        "SELECT * FROM chapters WHERE id = ? AND subject_id = ?",
        (chapter_id, subject_id),
    ).fetchone()
    if chapter is None:
        conn.close()
        return "Chapter not found.", 404

    # Optional query parameters
    try:
        num = int(request.args.get('n')) if request.args.get('n') else 50
    except ValueError:
        num = 50
    time_limit = request.args.get('time')  # minutes, optional string
    # Build base query
    base_q = "SELECT * FROM questions WHERE chapter_id = ?"
    params = [chapter_id]
    if num:
        # Random selection limited to 'num'
        query = f"{base_q} ORDER BY RANDOM() LIMIT ?"
        params.append(num)
        questions = conn.execute(query, params).fetchall()
    else:
        questions = conn.execute(base_q, params).fetchall()
    conn.close()
    return render_template(
        "chapter.html",
        chapter=chapter,
        questions=questions,
        time_limit=time_limit,
        results=None,
    )


# ── Score submitted answers ──────────────────────────────────────
@app.route('/subject/<int:subject_id>/chapter/<int:chapter_id>/submit', methods=['POST'])
def submit_exam(subject_id, chapter_id):
    conn = get_db()
    chapter = conn.execute(
        "SELECT * FROM chapters WHERE id = ? AND subject_id = ?",
        (chapter_id, subject_id),
    ).fetchone()
    if chapter is None and chapter_id == 0:
        if subject_id == 0:
            # Global custom random exam
            subject_check = conn.execute("SELECT id FROM subjects WHERE name = 'Mixed Subjects'").fetchone()
            if not subject_check:
                conn.execute("INSERT INTO subjects (name) VALUES ('Mixed Subjects')")
                conn.commit()
                subject_check = conn.execute("SELECT id FROM subjects WHERE name = 'Mixed Subjects'").fetchone()
            real_subject_id = subject_check['id']
            chapter = {'id': 0, 'title': 'Custom Random Exam', 'subject_id': 0}
        else:
            # Verify subject exists
            subject_check = conn.execute("SELECT * FROM subjects WHERE id = ?", (subject_id,)).fetchone()
            if subject_check is None:
                conn.close()
                return "Subject not found.", 404
            # Create a dummy chapter dict for template rendering
            real_subject_id = subject_id
            chapter = {'id': 0, 'title': 'Random Exam', 'subject_id': subject_id}
        
        # For random exams, we must know which questions were asked.
        q_ids = request.form.get("question_ids", "")
        if q_ids:
            # Fetch specifically the ones asked
            id_list = q_ids.split(",")
            placeholders = ",".join("?" for _ in id_list)
            questions = conn.execute(
                f"SELECT * FROM questions WHERE id IN ({placeholders})", id_list
            ).fetchall()
            # Sort them to match the original order
            q_dict = {str(q['id']): q for q in questions}
            questions = [q_dict[qid] for qid in id_list if qid in q_dict]
        else:
            questions = []
    elif chapter is None:
        conn.close()
        return "Chapter not found.", 404
    else:
        q_ids = request.form.get("question_ids", "")
        if q_ids:
            id_list = q_ids.split(",")
            placeholders = ",".join("?" for _ in id_list)
            questions = conn.execute(
                f"SELECT * FROM questions WHERE id IN ({placeholders})", id_list
            ).fetchall()
            q_dict = {str(q['id']): q for q in questions}
            questions = [q_dict[qid] for qid in id_list if qid in q_dict]
        else:
            questions = conn.execute(
                "SELECT * FROM questions WHERE chapter_id = ? ORDER BY id", (chapter_id,)
            ).fetchall()
    conn.close()

    results = []
    score = 0
    total_q = len(questions)
    for q in questions:
        chosen = request.form.get(f"question_{q['id']}", "")
        is_correct = chosen == q["correct_option"]
        if is_correct:
            score += 1
        results.append({
            "question_id": q["id"],
            "chosen": chosen,
            "correct": q["correct_option"],
            "is_correct": is_correct,
        })
        
    # Track user score if logged in
    user_id = session.get('user_id')
    if user_id:
        conn = get_db()
        conn.execute(
            "INSERT INTO scores (user_id, subject_id, chapter_id, score, total) VALUES (?, ?, ?, ?, ?)",
            (user_id, locals().get('real_subject_id', subject_id), chapter_id, score, total_q)
        )
        # Track wrong answers
        for r in results:
            if not r['is_correct'] and r['question_id']:
                existing = conn.execute("SELECT id FROM wrong_answers WHERE user_id = ? AND question_id = ?", (user_id, r['question_id'])).fetchone()
                if not existing:
                    conn.execute("INSERT INTO wrong_answers (user_id, question_id) VALUES (?, ?)", (user_id, r['question_id']))
        conn.commit()
        conn.close()

    return render_template(
        "chapter.html",
        chapter=chapter,
        questions=questions,
        results=results,
        score=score,
        total=total_q,
    )


# ── Auth & Dashboard ────────────────────────────────────────────────
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        display_name = request.form.get('display_name', '')
        conn = get_db()
        existing_user = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if existing_user:
            flash("Email already registered.")
        else:
            pwhash = generate_password_hash(password)
            conn.execute(
                "INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)",
                (email, pwhash, display_name)
            )
            conn.commit()
            user = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
            session['user_id'] = user['id']
            session['email'] = email
            conn.close()
            return redirect(url_for('dashboard'))
        conn.close()
    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        conn = get_db()
        user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        conn.close()
        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['email'] = user['email']
            return redirect(url_for('dashboard'))
        else:
            flash("Invalid email or password.")
    return render_template('login.html')


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))


@app.route('/dashboard')
def dashboard():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('login'))
        
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()

    scores_raw = conn.execute('''
        SELECT s.score, s.total, s.timestamp, sub.name as subject_name,
               CASE WHEN s.chapter_id = 0 THEN 'Random Exam' ELSE c.title END as chapter_title
        FROM scores s
        JOIN subjects sub ON s.subject_id = sub.id
        LEFT JOIN chapters c ON s.chapter_id = c.id
        WHERE s.user_id = ?
        ORDER BY s.timestamp DESC
    ''', (user_id,)).fetchall()

    scores = []
    for row in scores_raw:
        d = dict(row)
        ts = d.get('timestamp')
        if ts:
            if isinstance(ts, str):
                pass
            else:
                d['timestamp'] = ts.strftime('%Y-%m-%d %H:%M:%S')
        else:
            d['timestamp'] = None
        scores.append(d)

    # Compute stats
    total_exams = len(scores)
    total_correct = sum(s['score'] for s in scores)
    total_questions = sum(s['total'] for s in scores)
    avg_score = (total_correct / total_questions * 100) if total_questions > 0 else 0

    # XP & Level
    total_xp = sum(compute_xp(s['score'], s['total']) for s in scores)
    level_info = calculate_level(total_xp)

    # Subject breakdown for pie chart
    subject_stats = {}
    for s in scores:
        name = s['subject_name']
        if name not in subject_stats:
            subject_stats[name] = {'correct': 0, 'total': 0, 'exams': 0}
        subject_stats[name]['correct'] += s['score']
        subject_stats[name]['total'] += s['total']
        subject_stats[name]['exams'] += 1

    # Recent performance trend (last 10 exams, oldest first)
    recent = list(reversed(scores[:10]))
    trend_data = [
        {
            "label": r['subject_name'][:3].upper() + " " + (r['timestamp'].split(' ')[0][5:] if r['timestamp'] else ''),
            "percent": round(r['score'] / r['total'] * 100) if r['total'] > 0 else 0,
        }
        for r in recent
    ]

    # Daily activity for GitHub-style calendar
    daily_activity = {}
    for s in scores:
        date_str = s['timestamp'].split(' ')[0] if s['timestamp'] else None
        if date_str:
            daily_activity[date_str] = daily_activity.get(date_str, 0) + 1

    conn.close()
    return render_template('dashboard.html',
        user=user,
        scores=scores[:20],  # Last 20 for the table
        total_exams=total_exams,
        total_correct=total_correct,
        total_questions=total_questions,
        avg_score=round(avg_score, 1),
        level_info=level_info,
        subject_stats=json.dumps(subject_stats),
        trend_data=json.dumps(trend_data),
        daily_activity=json.dumps(daily_activity),
    )


# ── Profile ──────────────────────────────────────────────────────────
@app.route('/profile', methods=['GET', 'POST'])
def profile():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('login'))

    conn = get_db()
    if request.method == 'POST':
        display_name = request.form.get('display_name', '')
        bio = request.form.get('bio', '')
        college = request.form.get('college', '')
        year = request.form.get('year', '')
        goal = request.form.get('goal', '')

        conn.execute('''
            UPDATE users SET display_name = ?, bio = ?, college = ?, year = ?, goal = ?
            WHERE id = ?
        ''', (display_name, bio, college, year, goal, user_id))
        conn.commit()
        flash("Profile updated successfully!")

    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return render_template('profile.html', user=user)


@app.route('/profile/upload-pic', methods=['POST'])
def upload_profile_pic():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('login'))

    if 'profile_pic' not in request.files:
        flash("No file selected.")
        return redirect(url_for('profile'))

    file = request.files['profile_pic']
    if file.filename == '':
        flash("No file selected.")
        return redirect(url_for('profile'))

    if file and allowed_file(file.filename):
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"user_{user_id}_{uuid.uuid4().hex[:8]}.{ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        conn = get_db()
        # Delete old pic if exists
        old = conn.execute("SELECT profile_pic FROM users WHERE id = ?", (user_id,)).fetchone()
        if old and old['profile_pic']:
            old_path = os.path.join(app.config['UPLOAD_FOLDER'], old['profile_pic'])
            if os.path.exists(old_path):
                os.remove(old_path)

        conn.execute("UPDATE users SET profile_pic = ? WHERE id = ?", (filename, user_id))
        conn.commit()
        conn.close()
        flash("Profile picture updated!")
    else:
        flash("Invalid file type. Use PNG, JPG, GIF, or WebP.")

    return redirect(url_for('profile'))


# ── Delete Account ───────────────────────────────────────────────────
@app.route('/delete-account', methods=['POST'])
def delete_account():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('login'))

    conn = get_db()
    # Delete profile pic
    user = conn.execute("SELECT profile_pic FROM users WHERE id = ?", (user_id,)).fetchone()
    if user and user['profile_pic']:
        pic_path = os.path.join(app.config['UPLOAD_FOLDER'], user['profile_pic'])
        if os.path.exists(pic_path):
            os.remove(pic_path)

    conn.execute("DELETE FROM scores WHERE user_id = ?", (user_id,))
    conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()
    session.clear()
    flash("Your account has been deleted.")
    return redirect(url_for('home'))


# ── API: Stats JSON ─────────────────────────────────────────────────
@app.route('/api/stats')
def api_stats():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401

    conn = get_db()
    scores = conn.execute('''
        SELECT s.score, s.total, s.timestamp, sub.name as subject_name
        FROM scores s
        JOIN subjects sub ON s.subject_id = sub.id
        WHERE s.user_id = ?
        ORDER BY s.timestamp DESC
    ''', (user_id,)).fetchall()
    conn.close()

    subject_data = {}
    for s in scores:
        name = s['subject_name']
        if name not in subject_data:
            subject_data[name] = {'correct': 0, 'total': 0}
        subject_data[name]['correct'] += s['score']
        subject_data[name]['total'] += s['total']

    return jsonify({
        "subjects": subject_data,
        "total_exams": len(scores),
    })


def get_gemini_api_keys():
    env_keys = os.environ.get("GEMINI_API_KEYS")
    if env_keys:
        # Strip potential wrapping quotes around the entire env string
        env_keys = env_keys.strip('"\'')
        # Split by comma and strip quotes and whitespace from individual keys
        keys = [k.strip().strip('"\'') for k in env_keys.split(",") if k.strip()]
        if keys:
            return keys
    
    env_key = os.environ.get("GEMINI_API_KEY")
    if env_key:
        return [env_key.strip().strip('"\'')]
        
    # Hardcoded keys as fallback
    return [
        "AIzaSyBizGMGLRFcY61BO12MUjfKBPceEifplKA",
        "AIzaSyAemCeEY0Lqrt81anoDBxS4jzgyvkLlsg4"
    ]

def call_gemini_api(payload, model_candidates=None):
    if model_candidates is None:
        model_candidates = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-flash-latest"]
        
    api_keys = get_gemini_api_keys()
    last_error = None
    
    for api_key in api_keys:
        for model in model_candidates:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            try:
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode('utf-8'),
                    headers={'Content-Type': 'application/json'}
                )
                with urllib.request.urlopen(req, timeout=12) as response:
                    res_data = json.loads(response.read().decode('utf-8'))
                    text = res_data['candidates'][0]['content']['parts'][0]['text']
                    return text
            except Exception as e:
                err_str = ""
                if hasattr(e, 'read'):
                    try:
                        err_str = e.read().decode('utf-8')
                        err_body = json.loads(err_str)
                        last_error = err_body.get('error', {}).get('message', str(e))
                    except:
                        last_error = err_str if err_str else str(e)
                else:
                    last_error = str(e)
                
                # Print debug error info to server log
                print(f"Gemini API Error with model {model} using key {api_key[:6]}...: {last_error}", flush=True)
                
                # If we hit key issues (invalid/not found/forbidden) or quota/rate limits, skip this key immediately
                err_lower = last_error.lower()
                if any(x in err_lower for x in ['429', 'quota', 'limit', 'key', 'invalid', 'not found', '403']):
                    break
                    
    raise Exception(f"All Gemini API keys and model combinations failed. Last error: {last_error}")


# ── API: AI Explanation ──────────────────────────────────────────────
@app.route('/api/explain', methods=['POST'])
def api_explain():
    # user_id may be absent; AI explanations are allowed for guests
    # (If you need user‑specific context, you can handle it later)


    data = request.json
    question = data.get('question')
    options = data.get('options')
    correct_ans = data.get('correct')

    if not question or not options or not correct_ans:
        return jsonify({"error": "Missing data"}), 400

    prompt = (
        "তুমি একজন শিক্ষক। নিচের multiple choice প্রশ্নটির সঠিক উত্তর কেন সেটা 2-3টি সহজ বাক্যে বুঝিয়ে দাও। "
        "উত্তর দেওয়ার সময় সাধারণ কথাবার্তা বাংলায় লেখো, কিন্তু technical term, বৈজ্ঞানিক শব্দ, বা subject-specific শব্দ ইংরেজিতে রাখো। "
        "যেমন: 'এই বিক্রিয়াটি SN1 mechanism অনুসরণ করে কারণ carbocation intermediate তৈরি হয়।' "
        f"প্রশ্ন: {question}. "
        f"Options: {json.dumps(options)}. "
        f"সঠিক উত্তর হলো: '{correct_ans}'. "
        "এখন ব্যাখ্যা করো।"
    )

    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }

    try:
        explanation = call_gemini_api(payload)
        return jsonify({"explanation": explanation})
    except Exception as e:
        return jsonify({"error": str(e)}), 500




# ── API: AI Chat Widget ──────────────────────────────────────────────
@app.route('/api/chat', methods=['POST'])
def api_chat():
    data = request.json
    history = data.get('history', [])
    
    if not history:
        return jsonify({"error": "Missing history"}), 400

    user_id = session.get('user_id')
    performance_context = ""
    if user_id:
        conn = get_db()
        scores = conn.execute('''
            SELECT sub.name as subject_name, SUM(s.score) as total_correct, SUM(s.total) as total_questions
            FROM scores s
            JOIN subjects sub ON s.subject_id = sub.id
            WHERE s.user_id = ?
            GROUP BY sub.name
        ''', (user_id,)).fetchall()
        conn.close()

        if scores:
            perf_lines = []
            for row in scores:
                if row['total_questions'] > 0:
                    pct = int(row['total_correct'] / row['total_questions'] * 100)
                    perf_lines.append(f"{row['subject_name']}: {pct}%")
            if perf_lines:
                performance_context = (
                    "Here is the student's current performance data: " + ", ".join(perf_lines) + ". "
                    "If they are struggling (<50%) in a subject, offer encouraging advice. "
                    "If they are doing well, praise them. Use this context to personalize your responses naturally when it fits the conversation."
                )

    system_instruction = (
        "তুমি একজন বন্ধুত্বপূর্ণ, শান্ত শিক্ষক যে একজন ছাত্রকে ছোটখাটো উপদেশ এবং অনুপ্রেরণা দেয়। "
        "তোমার উত্তরগুলো খুব সংক্ষিপ্ত এবং উৎসাহজনক হতে হবে। "
        "বেশি কথা বলবে না। "
        "সাধারণ কথাবার্তা বাংলায় লেখো, কিন্তু technical term, বৈজ্ঞানিক শব্দ, বা subject-specific শব্দ ইংরেজিতে রাখো। "
        f"{performance_context}"
    )

    payload = {
        "systemInstruction": {
            "parts": [{"text": system_instruction}]
        },
        "contents": history
    }

    try:
        reply = call_gemini_api(payload)
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# ── Study Section ───────────────────────────────────────────────────
import glob
from flask import send_from_directory

def sanitize_filename_app(name):
    import re
    return re.sub(r'[\\/*?:"<>|]', "", name).strip()

@app.route('/study')
def study_home():
    conn = get_db()
    subjects = conn.execute("SELECT * FROM subjects").fetchall()
    conn.close()
    return render_template('study_home.html', subjects=subjects)

@app.route('/study/<int:subject_id>')
def study_subject(subject_id):
    conn = get_db()
    subject = conn.execute("SELECT * FROM subjects WHERE id = ?", (subject_id,)).fetchone()
    if subject is None:
        conn.close()
        return "Subject not found.", 404
    chapters = conn.execute("SELECT * FROM chapters WHERE subject_id = ?", (subject_id,)).fetchall()
    conn.close()
    return render_template('study_subject.html', subject=subject, chapters=chapters)

@app.route('/study/<int:subject_id>/chapter/<int:chapter_id>')
def study_chapter(subject_id, chapter_id):
    conn = get_db()
    subject = conn.execute("SELECT * FROM subjects WHERE id = ?", (subject_id,)).fetchone()
    chapter = conn.execute("SELECT * FROM chapters WHERE id = ? AND subject_id = ?", (chapter_id, subject_id)).fetchone()
    conn.close()
    if not subject or not chapter:
        return "Not found.", 404

    subject_sanitized = sanitize_filename_app(subject['name'])
    chapter_sanitized = sanitize_filename_app(chapter['title'])
    
    notes_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "notes", subject_sanitized, chapter_sanitized)
    pdf_filename = None
    if os.path.isdir(notes_dir):
        pdf_files = glob.glob(os.path.join(notes_dir, "*.pdf"))
        if pdf_files:
            pdf_filename = os.path.basename(pdf_files[0])
            
    return render_template('study_chapter.html', subject=subject, chapter=chapter, pdf_filename=pdf_filename)

@app.route('/api/notes/<int:subject_id>/<int:chapter_id>/<filename>')
def serve_note(subject_id, chapter_id, filename):
    conn = get_db()
    subject = conn.execute("SELECT * FROM subjects WHERE id = ?", (subject_id,)).fetchone()
    chapter = conn.execute("SELECT * FROM chapters WHERE id = ? AND subject_id = ?", (chapter_id, subject_id)).fetchone()
    conn.close()
    if not subject or not chapter:
        return "Not found.", 404
        
    subject_sanitized = sanitize_filename_app(subject['name'])
    chapter_sanitized = sanitize_filename_app(chapter['title'])
    notes_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "notes", subject_sanitized, chapter_sanitized)
    
    return send_from_directory(notes_dir, filename)


# ── Random exam across a subject ──────────────────────────────────────
@app.route('/subject/<int:subject_id>/random')
def subject_random_exam(subject_id):
    conn = get_db()
    # Verify subject exists
    subject = conn.execute("SELECT * FROM subjects WHERE id = ?", (subject_id,)).fetchone()
    if subject is None:
        conn.close()
        return "Subject not found.", 404
    # Optional query parameters for number of questions and time limit
    try:
        num = int(request.args.get('n')) if request.args.get('n') else None
    except ValueError:
        num = None
    time_limit = request.args.get('time')  # minutes, optional string
    # Get all question IDs for the subject across chapters
    base_q = "SELECT q.* FROM questions q JOIN chapters c ON q.chapter_id = c.id WHERE c.subject_id = ?"
    params = [subject_id]
    if num:
        query = f"{base_q} ORDER BY RANDOM() LIMIT ?"
        params.append(num)
        questions = conn.execute(query, params).fetchall()
    else:
        questions = conn.execute(base_q, params).fetchall()
    conn.close()
    # Reuse chapter template, pass a dummy chapter dict
    dummy_chapter = {'id': 0, 'title': f"Random Exam - {subject['name']}", 'subject_id': subject_id}
    return render_template(
        "chapter.html",
        chapter=dummy_chapter,
        questions=questions,
        time_limit=time_limit,
        results=None,
    )


# ── Global Random Exam ──────────────────────────────────────────────
@app.route('/random-exam')
def random_exam_setup():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('login'))
        
    conn = get_db()
    subjects = conn.execute("SELECT * FROM subjects").fetchall()
    chapters = conn.execute("SELECT * FROM chapters").fetchall()
    conn.close()
    
    subject_map = []
    for s in subjects:
        s_chapters = [c for c in chapters if c['subject_id'] == s['id']]
        subject_map.append({
            'id': s['id'],
            'name': s['name'],
            'chapters': s_chapters
        })
        
    return render_template('random_exam_setup.html', subject_map=subject_map)

@app.route('/random-exam/start', methods=['POST'])
def random_exam_start():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('login'))
        
    chapter_ids = request.form.getlist('chapter_ids')
    try:
        count = int(request.form.get('question_count', 20))
    except:
        count = 20
        
    time_limit = request.form.get('time_limit', '20')
    
    if not chapter_ids:
        flash("Please select at least one chapter.")
        return redirect(url_for('random_exam_setup'))
        
    conn = get_db()
    placeholders = ",".join("?" for _ in chapter_ids)
    
    query = f"SELECT * FROM questions WHERE chapter_id IN ({placeholders}) ORDER BY RANDOM() LIMIT ?"
    params = list(chapter_ids) + [count]
    
    questions = conn.execute(query, params).fetchall()
    conn.close()
    
    if not questions:
        flash("No questions found for the selected chapters.")
        return redirect(url_for('random_exam_setup'))
        
    dummy_chapter = {'id': 0, 'title': 'Custom Random Exam', 'subject_id': 0}
    
    return render_template(
        "chapter.html",
        chapter=dummy_chapter,
        questions=questions,
        time_limit=time_limit,
        results=None,
    )

# ── Leaderboard ─────────────────────────────────────────────────────
@app.route('/leaderboard')
def leaderboard():
    conn = get_db()
    users = conn.execute("SELECT * FROM users").fetchall()
    
    # Calculate total XP for each user based on their scores
    user_xps = []
    for u in users:
        scores = conn.execute("SELECT score, total FROM scores WHERE user_id = ?", (u['id'],)).fetchall()
        total_xp = sum(compute_xp(s['score'], s['total']) for s in scores)
        if total_xp > 0:
            level_info = calculate_level(total_xp)
            user_xps.append({
                "user": u,
                "total_xp": total_xp,
                "level_info": level_info
            })
            
    # Sort descending by total XP
    user_xps.sort(key=lambda x: x['total_xp'], reverse=True)
    conn.close()
    
    return render_template('leaderboard.html', leaderboard=user_xps)


# ── Legal Pages ─────────────────────────────────────────────────────
@app.route('/terms')
def terms():
    return render_template('terms.html')


@app.route('/privacy')
def privacy():
    return render_template('privacy.html')


# ── Live Exams ────────────────────────────────────────────────────────
@app.route('/live')
def live_dashboard():
    daily_status = get_live_exam_status('daily')
    weekly_status = get_live_exam_status('weekly')
    return render_template('live_dashboard.html', daily=daily_status, weekly=weekly_status)

@app.route('/live/<exam_type>')
def live_exam(exam_type):
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('login'))
        
    status = get_live_exam_status(exam_type)
    if not status['is_active']:
        flash(f"The {exam_type} live exam is not currently active.")
        return redirect(url_for('live_dashboard'))
        
    conn = get_db()
    taken = conn.execute(
        "SELECT id FROM live_exam_scores WHERE user_id=? AND exam_type=? AND date_str=?",
        (user_id, exam_type, status['date_str'])
    ).fetchone()
    
    if taken:
        conn.close()
        flash("You have already completed this live exam!")
        return redirect(url_for('live_dashboard'))
        
    questions = conn.execute("SELECT * FROM questions").fetchall()
    conn.close()
    
    # Deterministic random selection
    random.seed(f"{exam_type}_{status['date_str']}")
    selected_questions = random.sample(questions, min(100, len(questions)))
    random.seed() # reset
    
    return render_template(
        'live_exam.html', 
        questions=selected_questions,
        exam_type=exam_type,
        time_limit_seconds=status['seconds_remaining']
    )

@app.route('/live/<exam_type>/submit', methods=['POST'])
def submit_live_exam(exam_type):
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('login'))
        
    status = get_live_exam_status(exam_type)
    conn = get_db()
    taken = conn.execute(
        "SELECT id FROM live_exam_scores WHERE user_id=? AND exam_type=? AND date_str=?",
        (user_id, exam_type, status['date_str'])
    ).fetchone()
    
    if taken:
        conn.close()
        flash("You have already submitted this exam.")
        return redirect(url_for('live_dashboard'))
        
    questions = conn.execute("SELECT * FROM questions").fetchall()
    
    random.seed(f"{exam_type}_{status['date_str']}")
    selected_questions = random.sample(questions, min(100, len(questions)))
    random.seed()
    
    score = 0
    total = len(selected_questions)
    results = []
    
    for q in selected_questions:
        chosen = request.form.get(f"question_{q['id']}", "")
        is_correct = chosen == q["correct_option"]
        if is_correct:
            score += 1
        results.append({
            "question_id": q["id"],
            "chosen": chosen,
            "correct": q["correct_option"],
            "is_correct": is_correct,
        })
        
    conn.execute(
        "INSERT INTO live_exam_scores (user_id, exam_type, date_str, score, total) VALUES (?, ?, ?, ?, ?)",
        (user_id, exam_type, status['date_str'], score, total)
    )
    # Track wrong answers
    for r in results:
        if not r['is_correct'] and r['question_id']:
            existing = conn.execute("SELECT id FROM wrong_answers WHERE user_id = ? AND question_id = ?", (user_id, r['question_id'])).fetchone()
            if not existing:
                conn.execute("INSERT INTO wrong_answers (user_id, question_id) VALUES (?, ?)", (user_id, r['question_id']))
    conn.commit()
    conn.close()
    
    return render_template(
        'live_exam.html',
        questions=selected_questions,
        exam_type=exam_type,
        results=results,
        score=score,
        total=total,
        is_result=True
    )

@app.route('/live/leaderboard')
def live_leaderboard():
    conn = get_db()
    users = conn.execute("SELECT id, display_name, email, profile_pic FROM users").fetchall()
    
    leaderboard = []
    for u in users:
        scores = conn.execute("SELECT score, total FROM live_exam_scores WHERE user_id=?", (u['id'],)).fetchall()
        if not scores:
            continue
        total_correct = sum(s['score'] for s in scores)
        total_questions = sum(s['total'] for s in scores)
        leaderboard.append({
            "user": u,
            "total_score": total_correct,
            "total_questions": total_questions,
            "accuracy": round(total_correct/total_questions*100) if total_questions else 0
        })
        
    leaderboard.sort(key=lambda x: x['total_score'], reverse=True)
    conn.close()
    return render_template('live_leaderboard.html', leaderboard=leaderboard)

# ── AI Smart Revision ────────────────────────────────────────────────
@app.route('/ai_revision')
def ai_revision_landing():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('login'))
        
    conn = get_db()
    wrong_count = conn.execute("SELECT COUNT(id) as cnt FROM wrong_answers WHERE user_id = ?", (user_id,)).fetchone()['cnt']
    conn.close()
    
    return render_template('ai_revision_landing.html', wrong_count=wrong_count)

@app.route('/ai_revision/exam')
def ai_revision_exam():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('login'))
        
    conn = get_db()
    wrong_count = conn.execute("SELECT COUNT(id) as cnt FROM wrong_answers WHERE user_id = ?", (user_id,)).fetchone()['cnt']
    conn.close()
    
    if wrong_count == 0:
        flash("No active revision needed.")
        return redirect(url_for('ai_revision_landing'))
        
    max_questions = min(20, wrong_count)
    dummy_chapter = {'id': 'ai_revision', 'title': 'AI Smart Revision', 'subject_id': 0}
    
    return render_template(
        "ai_revision_exam.html",
        chapter=dummy_chapter,
        max_questions=max_questions
    )

@app.route('/api/ai_revision/next', methods=['POST'])
def ai_revision_next():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401
        
    data = request.json or {}
    exclude_ids = data.get('exclude_ids', [])
    
    conn = get_db()
    
    # Build query safely
    if exclude_ids:
        placeholders = ",".join("?" for _ in exclude_ids)
        query = f'''
            SELECT w.question_id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.explanation
            FROM wrong_answers w
            JOIN questions q ON w.question_id = q.id
            WHERE w.user_id = ? AND w.question_id NOT IN ({placeholders})
            ORDER BY RANDOM() LIMIT 1
        '''
        params = [user_id] + exclude_ids
        wrong_entry = conn.execute(query, params).fetchone()
    else:
        wrong_entry = conn.execute('''
            SELECT w.question_id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.explanation
            FROM wrong_answers w
            JOIN questions q ON w.question_id = q.id
            WHERE w.user_id = ?
            ORDER BY RANDOM() LIMIT 1
        ''', (user_id,)).fetchone()
        
    conn.close()
    
    if not wrong_entry:
        return jsonify({"status": "empty"})
        
    prompt = "You are an AI teacher. The student got the following multiple-choice question wrong. Generate a slightly modified version (different numbers, different context, or different phrasing) but testing the same concept. Return a JSON object with exact keys: 'original_id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option' (must be 'a', 'b', 'c', or 'd'), 'explanation'. Return ONLY valid JSON and nothing else.\n\n"
    
    q_data = {
        "id": wrong_entry['question_id'],
        "question_text": wrong_entry['question_text'],
        "option_a": wrong_entry['option_a'],
        "option_b": wrong_entry['option_b'],
        "option_c": wrong_entry['option_c'],
        "option_d": wrong_entry['option_d'],
        "correct_option": wrong_entry['correct_option']
    }
    prompt += json.dumps(q_data)
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    
    try:
        text_response = call_gemini_api(payload)
        
        # Clean potential markdown formatting
        if '```json' in text_response:
            text_response = text_response.split('```json')[1].split('```')[0].strip()
        elif '```' in text_response:
            text_response = text_response.split('```')[1].split('```')[0].strip()
            
        generated_q = json.loads(text_response)
        generated_q['original_id'] = wrong_entry['question_id']
        
        return jsonify({"status": "success", "question": generated_q})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai_revision/mark_correct', methods=['POST'])
def ai_revision_mark_correct():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401
        
    data = request.json or {}
    original_id = data.get('original_id')
    
    if original_id:
        conn = get_db()
        conn.execute("DELETE FROM wrong_answers WHERE user_id = ? AND question_id = ?", (user_id, original_id))
        conn.commit()
        conn.close()
        
    return jsonify({"success": True})

# ── AI Goal-Based Mock Exam ─────────────────────────────────────────
@app.route('/ai-mock-exam')
def ai_mock_exam():
    user = get_user_profile()
    if not user:
        return redirect(url_for('login'))
    return render_template('mock_exam.html', user=user)

@app.route('/api/generate-mock-question', methods=['GET'])
def generate_mock_question():
    user = get_user_profile()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    goal = user['goal'] if user['goal'] else ''
    year = user['year'] if user['year'] else ''
    
    data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
    files = glob.glob(os.path.join(data_dir, '*.json'))
    if not files:
        return jsonify({"error": "No data found"}), 500
        
    target_file = random.choice(files)
    if goal.lower() == 'medical':
        m_files = [f for f in files if 'medical' in f.lower() or 'biology' in f.lower()]
        if m_files: target_file = random.choice(m_files)
    elif goal.lower() == 'engineering':
        e_files = [f for f in files if 'physics' in f.lower() or 'math' in f.lower() or 'chemistry' in f.lower()]
        if e_files: target_file = random.choice(e_files)
    elif goal.lower() == 'university':
        u_files = [f for f in files if 'dhaka' in f.lower() or 'university' in f.lower()]
        if u_files: target_file = random.choice(u_files)

    try:
        with open(target_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        return jsonify({"error": "Failed to load data"}), 500
        
    if not data:
        return jsonify({"error": "Empty data"}), 500
        
    category = random.choice(data)
    questions = category.get('questions', [])
    if not questions:
        return jsonify({"error": "No questions in category"}), 500
        
    orig_q = random.choice(questions)
    
    if random.random() < 0.25:
        return jsonify({
            "question": orig_q.get('text', ''),
            "options": orig_q.get('options', {}),
            "correct": orig_q.get('correct', ''),
            "explanation": orig_q.get('explanation', ''),
            "is_ai": False
        })
        
    prompt = (
        f"You are an AI generating mock exam questions for a student in {year} aiming for {goal}. "
        f"Here is an original question: '{orig_q.get('text', '')}'. "
        f"Options: {json.dumps(orig_q.get('options', {}))}. "
        f"Correct Answer: {orig_q.get('correct', '')}. "
        "Create a similar but new multiple-choice question in the same language. "
        "Output strictly valid JSON with no markdown formatting. The JSON must have exactly these keys: "
        "'question' (string), 'options' (object with keys 'a', 'b', 'c', 'd'), 'correct' (string 'a', 'b', 'c', or 'd'), "
        "and 'explanation' (string)."
    )
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    
    try:
        text_resp = call_gemini_api(payload)
        
        if '```json' in text_resp:
            text_resp = text_resp.split('```json')[1].split('```')[0].strip()
        elif '```' in text_resp:
            text_resp = text_resp.split('```')[1].split('```')[0].strip()
            
        parsed = json.loads(text_resp)
        parsed['is_ai'] = True
        return jsonify(parsed)
    except Exception as e:
        print(f"Failed to generate AI question: {e}", flush=True)
        
    # Fallback
    return jsonify({
        "question": orig_q.get('text', ''),
        "options": orig_q.get('options', {}),
        "correct": orig_q.get('correct', ''),
        "explanation": orig_q.get('explanation', ''),
        "is_ai": False,
        "error": "AI fallback"
    })

# ── Run server ──────────────────────────────────────────────────────
if __name__ == "__main__":
    # Run the app locally only; WSGI servers like Gunicorn will skip this block
    port = int(os.environ.get("PORT", 5000))
    # Looks for a "FLASK_DEBUG" environment variable. Defaults to True if not found locally.
    debug_mode = os.environ.get("FLASK_DEBUG", "True").lower() in ("true", "1")
    
    app.run(host="0.0.0.0", port=port, debug=debug_mode)