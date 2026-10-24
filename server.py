from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).parent
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434").strip().rstrip("/") or "http://127.0.0.1:11434"
MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:3b").strip() or "qwen2.5:3b"
MAX_BODY_BYTES = 1_000_000


def normalize_model_name(name: str) -> str:
    """Normalize Ollama's implicit latest tag while preserving explicit tags."""
    name = name.strip()
    if ":" not in name.rsplit("/", 1)[-1]:
        name += ":latest"
    return name


def get_ollama_models() -> list[str]:
    """Return model tags already present in the local Ollama installation."""
    req = urllib.request.Request(f"{OLLAMA_URL}/api/tags")
    with urllib.request.urlopen(req, timeout=5) as response:
        result = json.load(response)
    if not isinstance(result, dict) or not isinstance(result.get("models"), list):
        raise ValueError("Ollama returned an invalid model list")
    return sorted({
        item["name"].strip()
        for item in result["models"]
        if isinstance(item, dict) and isinstance(item.get("name"), str) and item["name"].strip()
    })


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
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path == "/api/status":
            try:
                req = urllib.request.Request(f"{OLLAMA_URL}/api/tags")
                with urllib.request.urlopen(req, timeout=3) as response:
                    result = json.load(response)
                if not isinstance(result, dict) or not isinstance(result.get("models"), list):
                    raise ValueError("Ollama returned an invalid model list")
                models = get_ollama_models()
                configured = normalize_model_name(MODEL)
                available = any(normalize_model_name(name) == configured for name in models)
                return self.send_json(200, {
                    "online": True,
                    "model": MODEL,
                    "downloaded": available,
                    "models": models,
                })
            except Exception:
                return self.send_json(200, {"online": False, "model": MODEL, "downloaded": False})
        return super().do_GET()

    def do_POST(self):
        if self.path != "/api/chat":
            return self.send_json(404, {"error": "Not found"})
        requested_model = MODEL
        try:
            raw_length = self.headers.get("Content-Length")
            if raw_length is None:
                return self.send_json(411, {"error": "Content-Length header is required."})
            try:
                length = int(raw_length)
            except ValueError:
                return self.send_json(400, {"error": "Invalid Content-Length header."})
            if length < 0 or length > MAX_BODY_BYTES:
                return self.send_json(413, {"error": "Request body must be 1 MB or smaller."})
            try:
                body = json.loads(self.rfile.read(length))
            except (json.JSONDecodeError, UnicodeDecodeError):
                return self.send_json(400, {"error": "Request body must be valid JSON."})
            if not isinstance(body, dict):
                return self.send_json(400, {"error": "Request body must be a JSON object."})
            messages = body.get("messages")
            if not isinstance(messages, list) or not messages:
                return self.send_json(400, {"error": "At least one message is required."})
            if any(
                not isinstance(message, dict)
                or message.get("role") not in ("system", "user", "assistant")
                or not isinstance(message.get("content"), str)
                for message in messages
            ):
                return self.send_json(400, {"error": "Each message needs a valid role and text content."})

            requested_model = body.get("model", MODEL)
            if not isinstance(requested_model, str) or not requested_model.strip():
                return self.send_json(400, {"error": "Choose a valid local model name."})
            requested_model = requested_model.strip()
            installed_models = get_ollama_models()
            if not any(normalize_model_name(name) == normalize_model_name(requested_model) for name in installed_models):
                return self.send_json(400, {
                    "error": f"Model '{requested_model}' is not downloaded. Run: ollama pull {requested_model}"
                })

            payload = json.dumps({"model": requested_model, "messages": messages, "stream": False}).encode()
            req = urllib.request.Request(
                f"{OLLAMA_URL}/api/chat",
                data=payload,
                headers={"Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=300) as response:
                result = json.load(response)
            if not isinstance(result, dict):
                return self.send_json(502, {"error": "Ollama returned an invalid response."})
            message = result.get("message")
            if not isinstance(message, dict) or not isinstance(message.get("content"), str):
                return self.send_json(502, {"error": "Ollama response did not include message text."})
            return self.send_json(200, {"reply": message["content"], "model": requested_model})
        except urllib.error.HTTPError as exc:
            message = exc.read().decode(errors="replace")
            return self.send_json(502, {"error": f"Ollama error: {message[:500]}"})
        except Exception as exc:
            return self.send_json(503, {"error": f"Local AI unavailable for {requested_model}. Start Ollama and make sure this model is downloaded. Details: {exc}"})


def main() -> int:
    try:
        port = int(os.environ.get("PORT", "8000"))
    except ValueError:
        print("PORT must be a number between 1 and 65535.", file=sys.stderr)
        return 2
    if not 1 <= port <= 65535:
        print("PORT must be a number between 1 and 65535.", file=sys.stderr)
        return 2

    host = "127.0.0.1"
    try:
        server = ThreadingHTTPServer((host, port), Handler)
    except OSError as exc:
        print(f"Could not start the local server on {host}:{port}: {exc}", file=sys.stderr)
        print("If the port is already in use, choose another with PORT=8001.", file=sys.stderr)
        return 1

    print(f"Puffx Ofline GPT ready at http://{host}:{port} (model: {MODEL})")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Puffx Ofline GPT.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

