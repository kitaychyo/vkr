import requests
import os, json

API_KEY = os.getenv("STEAM_API_KEY")
match_id = 6627827589  # пример

url = f"https://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/v1/"
params = {
    "key": API_KEY,
    "match_id": match_id
}

response = requests.get(url, params=params)
data = response.json()
