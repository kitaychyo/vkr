# Dota 2 Live Predictor - Frontend

React-based frontend for real-time Dota 2 match predictions using LSTM neural networks.

## Features

- 📊 **Live Matches** - View ongoing professional Dota 2 matches with real-time win predictions
- 📈 **Prediction Charts** - Track how win probability changes throughout the match
- 📜 **Match History** - Browse completed matches
- 🎨 **Dark Theme** - Minimalistic dark-red design
- 📱 **Responsive** - Works on desktop and mobile

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Charts and graphs
- **React Router** - Navigation
- **Axios** - API client

## Development

### Prerequisites

- Node.js 18+
- Backend API running (see main README)

### Setup

```bash
# Install dependencies
npm install

# Create .env file (optional)
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### API Proxy

The development server proxies `/api` requests to `http://localhost:8000`. Change this in `vite.config.js` if needed.

## Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker

```bash
# Build and run with Docker Compose
docker-compose up --build
```

Frontend will be available at `http://localhost:80`

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx         # Navigation header
│   │   ├── MatchCard.jsx      # Match preview card
│   │   ├── MatchDetail.jsx    # Match details + chart
│   │   └── HistoryTable.jsx   # History table
│   ├── pages/
│   │   ├── Home.jsx           # Live matches list
│   │   ├── MatchPage.jsx      # Single match view
│   │   └── History.jsx        # Match history
│   ├── api.js                 # API client
│   ├── App.jsx                # Main app with routing
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles + Tailwind
├── Dockerfile
├── nginx.conf
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/live-matches` | List of live matches |
| `GET /api/live-matches/:id` | Match snapshots with predictions |
| `GET /api/matches-history` | Completed matches |

## Color Scheme

| Color | Value | Usage |
|-------|-------|-------|
| Background | `#0f0f0f` | Page background |
| Card | `#1a1a1a` | Card backgrounds |
| Accent | `#dc2626` | Primary accent (red) |
| Text | `#ffffff` | Primary text |
| Text Muted | `#a3a3a3` | Secondary text |
