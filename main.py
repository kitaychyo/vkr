from fastapi import FastAPI, HTTPException
from database.live_match_controller import get_all_live_matches
app = FastAPI(title="Live Matches API")

@app.get("/api/live-matches")
async def read_live_matches():
    data = get_all_live_matches()
    print(data)
    return data
