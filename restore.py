import os
import sqlite3
from sqlalchemy import create_engine, text

db_url = 'postgresql://postgres.fanhhjzyiwpdnuxashtf:DX7%23h9i%40UsW%24jpB@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres'
engine = create_engine(db_url)

# Mapping old chapter IDs to New chapter IDs (if they exist) or None if they need to be recreated
mapping = {
    11: {'new_id': 53, 'title': 'Circle', 'subject_id': 3},
    
    1: {'new_id': None, 'title': 'Qualitative Chemistry', 'subject_id': 1},
    2: {'new_id': 82, 'title': 'Chemical Bond', 'subject_id': 1},
    3: {'new_id': 83, 'title': 'Chemical Change', 'subject_id': 1},
    4: {'new_id': 86, 'title': 'Working Chemistry', 'subject_id': 1},
    5: {'new_id': None, 'title': 'Environmental Chemistry', 'subject_id': 1},
    6: {'new_id': None, 'title': 'Organic Chemistry', 'subject_id': 1},
    7: {'new_id': 84, 'title': 'Quantitative Chemistry', 'subject_id': 1},
    8: {'new_id': None, 'title': 'Electrochemistry', 'subject_id': 1},
    
    39: {'new_id': None, 'title': 'Vector', 'subject_id': 5},
    40: {'new_id': None, 'title': 'Newtonian Mechanics', 'subject_id': 5},
    41: {'new_id': None, 'title': 'Work Energy and Power', 'subject_id': 5},
    42: {'new_id': None, 'title': 'Gravity', 'subject_id': 5},
    43: {'new_id': None, 'title': 'Structural Properties of Matter', 'subject_id': 5},
    44: {'new_id': None, 'title': 'Periodic Motion', 'subject_id': 5},
    45: {'new_id': None, 'title': 'Ideal Gas and Kinetics', 'subject_id': 5},
    46: {'new_id': 81, 'title': 'Thermodynamics', 'subject_id': 5},
    47: {'new_id': 80, 'title': 'Static Electricity', 'subject_id': 5},
    48: {'new_id': 73, 'title': 'Current Electricity', 'subject_id': 5},
    49: {'new_id': 78, 'title': 'Physical Optics', 'subject_id': 5},
    50: {'new_id': 77, 'title': 'Modern Physics', 'subject_id': 5},
    51: {'new_id': 72, 'title': 'Atom', 'subject_id': 5},
    52: {'new_id': 79, 'title': 'Semiconductor', 'subject_id': 5},
}

def main():
    conn_sqlite = sqlite3.connect('exam.db')
    c_sqlite = conn_sqlite.cursor()
    
    with engine.begin() as conn_pg:
        # Step 1: Recreate missing chapters in Postgres and get their new IDs
        for old_id, data in mapping.items():
            if data['new_id'] is None:
                res = conn_pg.execute(text("INSERT INTO chapters (subject_id, title) VALUES (:sid, :title) RETURNING id"), 
                                      {'sid': data['subject_id'], 'title': data['title']})
                new_id = res.scalar()
                data['new_id'] = new_id
                print(f"Recreated chapter '{data['title']}' with ID {new_id}")
        
        # Step 2: Extract all questions from exam.db that belonged to the old_ids
        old_ids_tuple = tuple(mapping.keys())
        questions = c_sqlite.execute(f"SELECT id, chapter_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation FROM questions WHERE chapter_id IN {old_ids_tuple}").fetchall()
        
        # Step 3: Insert questions into Postgres with the new chapter IDs
        for q in questions:
            q_id, old_cid, q_text, opt_a, opt_b, opt_c, opt_d, corr_opt, expl = q
            new_cid = mapping[old_cid]['new_id']
            
            conn_pg.execute(text("""
                INSERT INTO questions (chapter_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
                VALUES (:cid, :text, :oa, :ob, :oc, :od, :co, :expl)
            """), {
                'cid': new_cid,
                'text': q_text,
                'oa': opt_a,
                'ob': opt_b,
                'oc': opt_c,
                'od': opt_d,
                'co': corr_opt,
                'expl': expl
            })
            
        print(f"Restored {len(questions)} questions successfully!")

if __name__ == '__main__':
    main()
