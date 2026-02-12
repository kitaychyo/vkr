import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database.ml_data_controller import get_match_snapshot
from database.live_match_controller import get_all_live_matches
from fastapi.middleware.cors import CORSMiddleware
from database.match_controller import get_matches_history

app = FastAPI(title="Live Matches API")

# Определить разрешенные источники для CORS
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173').split(',')
if os.getenv('RENDER') == 'true':
    # На Render добавить текущий URL
    render_url = os.getenv('RENDER_EXTERNAL_URL', '')
    if render_url:
        allowed_origins.append(render_url)
        allowed_origins.append(render_url.rstrip('/'))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Раздача статических файлов Frontend
frontend_dist = Path("frontend/dist")
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="static")

@app.get("/api/live-matches")
async def read_live_matches():
    data = get_all_live_matches()
    return data

@app.get("/api/live-matches/{match_id}")
async def read_live(match_id: int):
    data = get_match_snapshot(match_id)
    return data

@app.get("/api/matches-history")
async def read_history():
    data = get_matches_history()
    return data

@app.get("/api/matches-history/{match_id}")
async def read_history_match(match_id: int):
    data = get_match_snapshot(match_id)
    data.append({"result":"problem with steam api"})
    return data