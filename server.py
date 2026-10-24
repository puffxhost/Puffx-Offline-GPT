from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).parent
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434")
MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:3b")

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT / "static"), **kwargs)

    def log_message(self, fmt, *args):
        print(f"[{self.log_date_time_string()}] {fmt % args}")

    def send_json(self, code, payload):
        data = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path == "/api/status":
            try:
                req = urllib.request.Request(f"{OLLAMA_URL}/api/tags")
                with urllib.request.urlopen(req, timeout=3) as response:
                    models = json.load(response).get("models", [])
                available = any(m.get("name", "").split(":")[0] == MODEL.split(":")[0] for m in models)
                return self.send_json(200, {"online": True, "model": MODEL, "downloaded": available})
            except Exception:
                return self.send_json(200, {"online": False, "model": MODEL, "downloaded": False})
        return super().do_GET()

    def do_POST(self):
        if self.path != "/api/chat":
            return self.send_json(404, {"error": "Not found"})
        try:
            body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))
            messages = body.get("messages", [])
            if not messages:
                return self.send_json(400, {"error": "At least one message is required."})
            payload = json.dumps({"model": MODEL, "messages": messages, "stream": False}).encode()
            req = urllib.request.Request(f"{OLLAMA_URL}/api/chat", data=payload, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=300) as response:
                result = json.load(response)
            return self.send_json(200, {"reply": result.get("message", {}).get("content", ""), "model": MODEL})
        except urllib.error.HTTPError as exc:
            message = exc.read().decode(errors="replace")
            return self.send_json(502, {"error": f"Ollama error: {message[:500]}"})
        except Exception as exc:
            return self.send_json(503, {"error": f"Local AI unavailable. Start Ollama and download {MODEL}. Details: {exc}"})

if __name__ == "__main__":
    host, port = "127.0.0.1", int(os.environ.get("PORT", "8000"))
    print(f"OfflineGPT ready at http://{host}:{port} (model: {MODEL})")
    ThreadingHTTPServer((host, port), Handler).serve_forever()
