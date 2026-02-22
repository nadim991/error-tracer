
# Error Tracer 

AI-powered tool that traces errors to their root cause across multiple files.

## The Problem
When an error shows up in one file, the actual root cause is often buried in a completely different file. Manually tracing through 5-6 files is painful and time-consuming.

## The Solution
Error Tracer automatically scans your entire codebase and finds the root cause — not just the symptom.

## Features
- Multi-file error tracing
- AI-powered root cause analysis
- VS Code extension
- Python backend

## How to Use
1. Run the backend server
2. Select error text in VS Code
3. Run "Trace Error Root Cause" command
4. Get instant root cause analysis

## Setup
```bash
cd backend
pip install flask groq
python app.py
```

## Built With
- Python + Flask
- Groq AI
- TypeScript + VS Code Extension API
  
