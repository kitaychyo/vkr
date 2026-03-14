# Dota 2 Live Predictor

Real-time win probability predictions for professional Dota 2 matches using LSTM neural networks.

## 🎯 Overview

This project collects live match data from Steam API, processes it through a trained LSTM model, and provides win probability predictions displayed through a web interface.

## 🏗 Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│  Steam API  │────▶│   Collector  │────▶│  PostgreSQL │────▶│  FastAPI    │
│  (Dota 2)   │     │  (every 60s) │     │   Database  │     │   Backend   │
└─────────────┘     └──────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │◀────│    React     │◀────│   LSTM      │◀────│  Snapshot   │
│   (Frontend)│     │   Frontend   │     │   Model     │     │   Data      │
└─────────────┘     └──────────────┘     └─────────────┘     └─────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL
- Steam API Key

### 1. Clone and Setup

```bash
cd /path/to/project
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your credentials
```

### 3. Database Setup

```bash
# Run migrations
alembic upgrade head
```

### 4. Start Services

```bash
# Terminal 1: Start collector (data collection)
python -m steam_api.collector

# Terminal 2: Start API server
fastapi dev main.py

# Terminal 3: Start frontend (in another terminal)
cd frontend
npm install
npm run dev
```

### 5. Access the Application

- **Frontend:** http://localhost:5173
- **API:** http://localhost:8000/api

## 📁 Project Structure

```
vkr/
├── main.py                    # FastAPI application
├── requirements.txt           # Python dependencies
├── alembic/                   # Database migrations
├── database/
│   ├── models.py             # SQLAlchemy models
│   ├── db.py                 # Database connection
│   ├── live_match_controller.py
│   ├── match_controller.py
│   ├── ml_data_controller.py
│   └── data_for_predict_controller.py
├── steam_api/
│   ├── collector.py          # Data collection loop
│   ├── match_list.py         # Steam API client
│   ├── parse_match.py        # Data parsing
│   └── match_result.py
├── LSTM_model/
│   ├── predict.py            # Model inference
│   ├── LSTM.py               # Model architecture
│   ├── dataset.py            # Data preprocessing
│   └── *.pth, *.keras        # Model weights
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── api.js            # API client
│   │   └── App.jsx           # Main app
│   ├── package.json
│   └── vite.config.js
└── docker-compose.yml        # Docker setup
```

## 🔧 Configuration

### Environment Variables (.env)

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

## 🎮 Features

### Live Match Prediction

- Collects data every 60 seconds from Steam API
- Extracts features: heroes, items, gold, XP, towers, barracks, Roshan
- LSTM model predicts win probability for 4 feature combinations:
  - `all` - All features combined
  - `econ+comp` - Economy + Team composition
  - `econ+obj` - Economy + Objectives
  - `comp+obj` - Composition + Objectives

### Web Interface

- **Live Matches** - Cards showing ongoing matches with win probability bars
- **Match Details** - Detailed view with prediction over time chart
- **History** - Table of completed matches

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Access:
# - Frontend: http://localhost:80
# - Backend: http://localhost:8000
# - Database: localhost:5432
```

## 📊 Model Details

The LSTM model uses three separate LSTM networks:

1. **Economy LSTM** - Gold, net worth, experience
2. **Composition LSTM** - Hero picks, items
3. **Objectives LSTM** - Towers, barracks, Roshan

Outputs are fused and passed through a final FC layer for binary classification.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/live-matches` | List all live matches |
| GET | `/api/live-matches/{id}` | Get match snapshots |
| GET | `/api/matches-history` | Get completed matches |

## 🛠 Development

### Running Tests

```bash
python -m pytest
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

### Frontend Development

```bash
cd frontend
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## 📝 TODO

- [ ] Add WebSocket for real-time updates
- [ ] Improve model accuracy with more training data
- [ ] Add player statistics view
- [ ] Add match timeline visualization
- [ ] Deploy to production

## 📄 License

MIT

## 👤 Author

Developed for VRK (Graduation Project)
