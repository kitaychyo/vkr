FROM python:3.11-slim

# Рабочая директория
WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Копируем зависимости и устанавливаем их
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код приложения
COPY . .

# Переменная окружения для порта, который подставляет PaaS
ENV PORT=8000
EXPOSE $PORT

# Healthcheck для проверки, что приложение отвечает
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/api/live-matches || exit 1

# Запуск collector.py в фоне и uvicorn для API
CMD ["sh", "-c", "python -m steam_api.collector & uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
