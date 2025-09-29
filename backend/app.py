from flask import Flask, request, jsonify
import sqlite3, os
from pathlib import Path

DB_DIR = os.getenv("DB_DIR", "/data")
Path(DB_DIR).mkdir(parents=True, exist_ok=True)
DB_PATH = os.path.join(DB_DIR, "app.db")

app = Flask(__name__)

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Ensure table exists
with get_conn() as conn:
    conn.execute("""CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        done BOOLEAN NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""")

@app.route("/api/todos", methods=["GET"])
def list_todos():
    conn = get_conn()
    rows = conn.execute("SELECT id, text, done FROM todos").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/todos", methods=["POST"])
def add_todo():
    payload = request.get_json(force=True)
    text = payload.get("text", "").strip()
    if not text:
        return jsonify({"error": "text required"}), 400
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("INSERT INTO todos (text) VALUES (?)", (text,))
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return jsonify({"status": "ok", "id": new_id})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
