import os
import sys
import shutil
from sqlalchemy import create_engine, text

def main():
    if len(sys.argv) < 2:
        print("Usage: .\\python_runtime\\python.exe add_subject_pdfs.py \"Subject Name\"")
        print("Example: .\\python_runtime\\python.exe add_subject_pdfs.py \"Chemistry\"")
        sys.exit(1)
        
    subject_name = sys.argv[1]
    db_url = 'postgresql://postgres.fanhhjzyiwpdnuxashtf:DX7%23h9i%40UsW%24jpB@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres'
    pdfs_dir = 'PDFs'
    
    if not os.path.isdir(pdfs_dir):
        print(f"Error: {pdfs_dir} directory not found.")
        sys.exit(1)

    print(f"Connecting to remote database and adding PDFs for subject: {subject_name}...")
    
    try:
        engine = create_engine(db_url)
        with engine.begin() as conn:
            res = conn.execute(text("SELECT id FROM subjects WHERE name = :name"), {'name': subject_name})
            subject_id = res.scalar()
            
            if not subject_id:
                print(f"Error: Subject '{subject_name}' not found in the database.")
                sys.exit(1)
                
            res = conn.execute(text("SELECT title FROM chapters WHERE subject_id = :sid"), {'sid': subject_id})
            existing_chapters = set(row[0] for row in res)
            
            added_count = 0
            for filename in os.listdir(pdfs_dir):
                if filename.lower().endswith('.pdf'):
                    chapter_title = filename[:-4]
                    
                    if chapter_title not in existing_chapters:
                        conn.execute(
                            text("INSERT INTO chapters (subject_id, title) VALUES (:sid, :title)"), 
                            {'sid': subject_id, 'title': chapter_title}
                        )
                        print(f"Inserted chapter: '{chapter_title}'")
                    
                    # Copy the PDF to the correct notes directory
                    dest_dir = os.path.join('notes', subject_name, chapter_title)
                    os.makedirs(dest_dir, exist_ok=True)
                    src_pdf = os.path.join(pdfs_dir, filename)
                    dest_pdf = os.path.join(dest_dir, filename)
                    shutil.copy2(src_pdf, dest_pdf)
                    print(f"Copied {filename} to {dest_pdf}")
                    added_count += 1
                    
            print(f"\nDone! Processed {added_count} PDFs for {subject_name}.")
            print("You can safely delete the PDFs from the PDFs/ folder now if you wish, as they have been copied to notes/.")
            
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == '__main__':
    main()
