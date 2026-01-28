import requests
import json
from dotenv import load_dotenv
import os
load_dotenv()

API_KEY = os.getenv("STEAM_API_KEY")

def fetch_match_list():
    url = f"https://api.steampowered.com/IDOTA2Match_570/GetLiveLeagueGames/v1/?key={API_KEY}&dpc=true"
    result = []
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        games = data.get("result", {}).get("games", [])
        for game in games:
            if game.get("scoreboard", {}).get("duration", 0) > 0:
                result.append(game)

        return result

    except requests.RequestException as e:
        print(f"Ошибка при запросе: {e}")
        return None

