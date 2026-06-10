import os

def replace_in_file(filepath, old_str, new_str):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if old_str in content:
        new_content = content.replace(old_str, new_str)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Replaced in {filepath}")

def main():
    root_dir = "C:/Users/Asif/Desktop/Project101"
    extensions = {'.py', '.html', '.css', '.js', '.md', '.txt'}
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        if 'node_modules' in dirpath or '.git' in dirpath or '__pycache__' in dirpath or 'scratch' in dirpath:
            continue
        for filename in filenames:
            ext = os.path.splitext(filename)[1]
            if ext in extensions:
                filepath = os.path.join(dirpath, filename)
                try:
                    replace_in_file(filepath, "ExamPrep", "MedhaRank")
                except Exception as e:
                    print(f"Error in {filepath}: {e}")

if __name__ == "__main__":
    main()
