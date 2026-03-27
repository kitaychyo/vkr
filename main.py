import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from database.ml_data_controller import get_match_snapshot
from database.live_match_controller import get_all_live_matches
from fastapi.middleware.cors import CORSMiddleware
from database.match_controller import get_matches_history
import requests

app = FastAPI(title="Dota 2 Live Predictor API")

origins = [
    "https://vkr-frontend.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Steam API key for hero images
STEAM_API_KEY = os.getenv("STEAM_API_KEY", "")

# API Routes
@app.get("/api/live-matches")
async def read_live_matches():
    data = get_all_live_matches()
    return data

@app.get("/api/live-matches/{match_id}")
async def read_live(match_id: int):
    data = get_match_snapshot(match_id)
    return data

@app.get("/api/matches-history")
async def read_history(
    search: str = "",
    radiant_team: str = "",
    dire_team: str = "",
    status: str = "",
    min_duration: int = 0,
    max_duration: int = 9999,
):
    data = get_matches_history(
        search=search,
        radiant_team=radiant_team,
        dire_team=dire_team,
        status=status,
        min_duration=min_duration,
        max_duration=max_duration,
    )
    return data

@app.get("/api/matches-history/{match_id}")
async def read_history_match(match_id: int):
    data = get_match_snapshot(match_id)
    data.append({"result": "problem with steam api"})
    return data

# Get hero images from Steam API
@app.get("/api/heroes")
async def get_heroes():
    """Get list of all heroes with images from Steam API"""
    try:
        url = f"https://api.steampowered.com/IEconDOTA2_570/GetHeroes/v1/?key={STEAM_API_KEY}&language=english"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        heroes = data.get("result", {}).get("heroes", [])
        hero_images = {}
        
        for hero in heroes:
            hero_id = hero.get("id")
            hero_name = hero.get("name")  # e.g., "npc_dota_hero_antimage"
            if hero_id and hero_name:
                clean_name = hero_name.replace("npc_dota_hero_", "")
                hero_images[hero_id] = {
                    "id": hero_id,
                    "name": clean_name,
                    "image": f"https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/{clean_name}.png",
                    "icon": f"https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/{clean_name}.png"
                }
        
        return JSONResponse(content={"heroes": hero_images})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get item images from Steam CDN
@app.get("/api/items")
async def get_items():
    """Get list of all items with images from Steam CDN"""
    items = {
        1: "blink", 2: "boots_of_speed", 3: "gloves_of_haste",
        11: "gauntlets", 13: "slippers", 15: "mantle", 16: "iron_branch",
        20: "boots_of_travel", 34: "magic_stick", 36: "magic_wand",
        43: "null_talisman", 44: "wraith_band", 46: "bracer",
        63: "power_treads", 100: "hand_of_midas", 102: "oblivion_staff",
        108: "black_king_bar", 116: "orchid", 123: "maelstrom",
        127: "desolator", 133: "mjollnir", 135: "satanic", 137: "radiance",
        139: "monkey_king_bar", 141: "battle_fury", 145: "daedalus",
        147: "butterfly", 151: "divine_rapier", 152: "bloodstone",
        154: "aghanims_scepter", 156: "refresher_orb", 158: "assault",
        160: "heart", 164: "sheepstick", 166: "shivas_guard",
        168: "bloodthorn", 172: "ethereal_blade", 174: "soul_ring",
        178: "arcane_boots", 180: "orb_of_venom", 185: "diffusal_blade",
        188: "phase_boots", 208: "tranquil_boots", 214: "shadow_blade",
        216: "sange_yasha", 220: "manta", 222: "heavens_halberd",
        226: "euls", 230: "force_staff", 232: "dagon",
        236: "necronomicon", 237: "ultimate_orb", 240: "vladmir",
        244: "drum_of_endurance", 249: "medallion_of_courage",
        259: "ring_of_basilius", 263: "vanguard", 265: "blade_mail",
        267: "soul_booster", 269: "hood_of_defiance", 273: "rapier",
        277: "aghanims_shard", 306: "blight_stone", 331: "wind_lace",
        422: "echo_sabre", 433: "aether_lens", 436: "dragon_lance",
        439: "octarine_core", 442: "solar_crest", 444: "lotus_orb",
        448: "glimmer_cape", 452: "aeon_disk", 454: "kaya",
        456: "pipe", 458: "crimson_guard", 460: "armlet",
        463: "shadow_amulet", 471: "silver_edge", 473: "hurricane_pike",
        485: "eternal_shroud", 496: "kaya_sange", 508: "witch_blade",
        525: "disperser", 537: "nullifier", 541: "cheese",
        545: "observer_ward", 546: "sentry_ward", 547: "tango",
        550: "tp_scroll", 551: "bottle", 553: "holy_locket",
        554: "orb_of_corrosion", 560: "gleipnir", 561: "crown",
        563: "trusty_shovel", 574: "berserkers_axe", 575: "broadsword",
        576: "chainmail", 577: "claymore", 578: "helm_of_iron_will",
        579: "javelin", 580: "mithril_hammer", 581: "platemail",
        582: "quarterstaff", 583: "quelling_blade", 584: "ring_of_protection",
        1123: "boots_of_travel_2",
    }
    
    item_images = {}
    for item_id, item_name in items.items():
        item_images[item_id] = {
            "id": item_id,
            "name": item_name,
            "image": f"https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/{item_name}.png"
        }
    
    return JSONResponse(content={"items": item_images})

# Get team logo from OpenDota API
@app.get("/api/teams/{team_id}/logo")
async def get_team_logo(team_id: int):
    """Get team logo URL from OpenDota API with Steam CDN fallback"""
    try:
        if team_id == 0:
            return JSONResponse(content={"logo_url": None})
        
        # Try OpenDota API first
        response = requests.get(f"https://api.opendota.com/api/teams/{team_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            logo_url = data.get("logo_url")
            if logo_url:
                return JSONResponse(content={"logo_url": logo_url})
        
        # Fallback to Steam CDN format
        steam_logo = f"https://cdn.cloudflare.steamstatic.com/apps/dota2/images/team_logos/{team_id}.png"
        return JSONResponse(content={"logo_url": steam_logo})
        
    except Exception as e:
        # Fallback to Steam CDN on error
        steam_logo = f"https://cdn.cloudflare.steamstatic.com/apps/dota2/images/team_logos/{team_id}.png"
        return JSONResponse(content={"logo_url": steam_logo})

# Serve frontend static files
FRONTEND_DIR = Path(__file__).parent / "frontend" / "dist"

if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Don't serve static files for API routes
        if full_path.startswith("api"):
            return {"detail": "Not Found"}, 404
        
        index_file = FRONTEND_DIR / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        else:
            return {"detail": "Frontend not built. Run 'npm run build' in frontend directory"}, 404
