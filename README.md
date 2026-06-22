# Dota 2 Live Predictor

## 🌐 **Выберите язык:** [English](README_EN.md) | [Русский](README.md)

Прогнозирование вероятности победы в профессиональных матчах Dota 2 с использованием LSTM.

## Обзор

Этот проект был разработан как выпускная работа и исследует интерпретируемое предсказание результатов в динамических многоагентных системах на примере профессиональных матчей Dota 2.

Система собирает данные о live-матчах через Steam API, обрабатывает временные состояния игры с помощью обученной модели LSTM и предоставляет оценки вероятности победы в реальном времени через веб-интерфейс.

## Архитектура

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│  Steam API  │────>│   Collector  │────>│  PostgreSQL │────>│  FastAPI    │
│  (Dota 2)   │     │  (каждые 60с)│     │   Database  │     │   Backend   │
└─────────────┘     └──────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │<────│    React     │<────│   LSTM      │<────│  Snapshot   │
│  (Frontend) │     │   Frontend   │     │   Model     │     │   Data      │
└─────────────┘     └──────────────┘     └─────────────┘     └─────────────┘
```

## Быстрый старт

### Требования

- Python 3.11+
- Node.js 18+
- PostgreSQL
- Steam API Key

### 1. Клонирование и настройка

```bash
cd /path/to/project
```

### 2. Настройка бэкенда

```bash
# Создание виртуального окружения
python -m venv .venv
source .venv/bin/activate  # Для Windows: .venv\Scripts\activate

# Установка зависимостей
pip install -r requirements.txt

# Создание файла .env
cp .env.example .env
# Отредактируйте .env с вашими данными
```

### 3. Настройка базы данных

```bash
# Применение миграций
alembic upgrade head
```

### 4. Запуск сервисов

```bash
# Терминал 1: запуск сбора данных
python -m steam_api.collector

# Терминал 2: запуск API
fastapi dev main.py

# Терминал 3: запуск фронтенда
cd frontend
npm install
npm run dev
```

### 5. Доступ к приложению

- **Frontend:** http://localhost:5173
- **API:** http://localhost:8000/api

## Структура проекта

```
vkr/
├── main.py                    # FastAPI приложение
├── requirements.txt           # Python зависимости
├── alembic/                   # Миграции базы данных
├── database/
│   ├── models.py             # SQLAlchemy модели
│   ├── db.py                 # Подключение к базе данных
│   ├── live_match_controller.py
│   ├── match_controller.py
│   ├── ml_data_controller.py
│   └── data_for_predict_controller.py
├── steam_api/
│   ├── collector.py          # Сбор данных
│   ├── match_list.py         # Клиент Steam API
│   ├── parse_match.py        # Разбор данных
│   └── match_result.py
├── LSTM_model/
│   ├── predict.py            # Инференс модели
│   ├── LSTM.py               # Архитектура модели
│   ├── dataset.py            # Предобработка данных
│   └── *.pth, *.keras        # Веса модели
└── frontend/
    ├── src/
    │   ├── components/       # React компоненты
    │   ├── pages/            # Страницы
    │   ├── api.js            # Клиент API
    │   └── App.jsx           # Главный компонент
    ├── package.json
    └── vite.config.js
```

## Конфигурация

### Переменные окружения (.env)

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=dota2

# Steam API
STEAM_API_KEY=your_steam_api_key

# Frontend (optional)
VITE_API_URL=http://localhost:8000/api
```

## Возможности

### Прогноз live-матчей

- Собирает данные каждые 60 секунд из Steam API
- Извлекает признаки: герои, предметы, золото, опыт, башни, бараки, Roshan
- Модель LSTM прогнозирует вероятность победы для 4 комбинаций признаков:
  - `all` — все признаки вместе
  - `econ+comp` — экономика + состав команды
  - `econ+obj` — экономика + objectives
  - `comp+obj` — состав + objectives

### Веб-интерфейс

- **Live Matches** — карточки с активными матчами и полосами вероятности победы
- **Match Details** — подробный просмотр с графиком прогноза во времени
- **History** — таблица завершённых матчей

## Детали модели

Модель LSTM использует три отдельные сети:

1. **Economy LSTM** — золото, чистая стоимость, опыт
2. **Composition LSTM** — выбор героев, предметы
3. **Objectives LSTM** — башни, бараки, Roshan

Выходы объединяются и передаются через финальный полносвязный слой для бинарной классификации.

## API эндпоинты

| Метод | Endpoint | Описание |
|--------|----------|----------|
| GET | `/api/live-matches` | Список активных матчей |
| GET | `/api/live-matches/{id}` | Получение снимков матча |
| GET | `/api/matches-history` | История завершённых матчей |

## Разработка

### Миграции базы данных

```bash
# Создание новой миграции
alembic revision --autogenerate -m "description"

# Применение миграций
alembic upgrade head
```

### Разработка фронтенда

```bash
cd frontend
npm run dev      # Сервер разработки
npm run build    # Production build
npm run preview  # Предпросмотр build
```
