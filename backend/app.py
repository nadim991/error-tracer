
from flask import Flask, request, jsonify
import os
from groq import Groq

app = Flask(__name__)

import os
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

def scan_codebase(project_path):
    file_map = {}
    for root, dirs, files in os.walk(project_path):
        dirs[:] = [d for d in dirs if d not in ['venv', '.git', '__pycache__', 'node_modules']]
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                file_map[filepath] = content
    return file_map

def find_root_cause(error, file_map):
    client = Groq(api_key=GROQ_API_KEY)
    
    codebase_context = ""
    for filepath, content in file_map.items():
        codebase_context += f"\n\n--- FILE: {filepath} ---\n{content}"
    
    prompt = f"""
You are an expert Python debugger.

ERROR:
{error}

CODEBASE:
{codebase_context}

Find the ROOT CAUSE of this error. Which file and line is actually causing it?
Give a clear explanation and suggest a fix.
"""
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.choices[0].message.content

@app.route('/trace', methods=['POST'])
def trace_error():
    data = request.json
    error = data.get('error')
    project_path = data.get('project_path')
    
    if not all([error, project_path]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    file_map = scan_codebase(project_path)
    result = find_root_cause(error, file_map)
    
    return jsonify({'result': result, 'files_scanned': len(file_map)})

if __name__ == '__main__':
    app.run(port=5000, debug=True)