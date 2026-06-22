# Dota 2 Live Predictor

Стабильный проект для сервера прогнозов Dota 2 матчей на FastAPI с PostgreSQL.

## Обзор

Проект собирает данные из Steam API, сохраняет их в базу данных и предоставляет REST API для live-матчей и истории.

## Быстрый старт

### Требования

- Python 3.11+
- PostgreSQL
- Steam API ключ

### Установка

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Настройка окружения

Создайте файл `.env` в корне проекта и добавьте значения:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=dota2
STEAM_API_KEY=your_steam_api_key
```

### Запуск базы данных

```bash
alembic upgrade head
```

### Запуск сервера

```bash
uvicorn main:app --reload
```

### Основные эндпойнты

- `GET /api/live-matches`
- `GET /api/live-matches/{match_id}`
- `GET /api/matches-history`
- `GET /api/matches-history/{match_id}`

## Структура проекта

- `main.py` — FastAPI приложение
- `requirements.txt` — зависимости
- `alembic/` — миграции базы данных
- `database/` — модели и контроллеры данных
- `steam_api/` — сбор данных из Steam
- `LSTM_model/` — модель и инструменты предсказания
- `frontend/` — клиентская часть

## Примечания

- Файл `.env` не должен попадать в систему контроля версий.
- Для корректной работы необходимо заполнить переменные окружения.

## API

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/live-matches` | Список живых матчей |
| GET | `/api/live-matches/{match_id}` | Данные по конкретному матчу |
| GET | `/api/matches-history` | История матчей |
| GET | `/api/matches-history/{match_id}` | Данные по истории матча |
