FROM python:3.12-slim
LABEL org.opencontainers.image.source="https://github.com/puffxhost/Puffx-Offline-GPT"
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 HOST=0.0.0.0 PORT=8000 OLLAMA_URL=http://ollama:11434 OLLAMA_MODEL=qwen2.5:3b
COPY --chown=65534:65534 server.py /app/server.py
COPY --chown=65534:65534 developer_profile.md /app/developer_profile.md
COPY --chown=65534:65534 static/ /app/static/
USER 65534:65534
EXPOSE 8000
CMD ["python", "server.py"]
