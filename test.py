import requests
import json

API_KEY = "3E053A4AAAF62540FF209B03A4C2D54D"
MIN_DURATION = 1  # 20 минут в секундах

def fetch_one_live_match_over_duration():
    url = f"https://api.steampowered.com/IDOTA2Match_570/GetLiveLeagueGames/v1/?key={API_KEY}&dpc=true"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        print(data)
        games = data.get("result", {}).get("games", [])

        # ищем матч с duration > MIN_DURATION
        for game in games:
            scoreboard = game.get("scoreboard", {})
            duration = scoreboard.get("duration", 0)
            if duration > MIN_DURATION:
                return game
        return None
    except requests.RequestException as e:
        print(f"Ошибка при запросе: {e}")
        return None

if __name__ == "__main__":
    match = fetch_one_live_match_over_duration()
    if match:
        print(json.dumps(match, indent=2, ensure_ascii=False))
    else:
        print(f"Нет матчей с duration > {MIN_DURATION} секунд")
