def parse_match_list(games):

    matches = []
    for game in games:
        radiant = game.get("radiant_team") or {}
        dire = game.get("dire_team") or {}

        match_info = {
            "match_id": game.get("match_id"),
            "duration": game.get("scoreboard", {}).get("duration", 0),

            "RadiantTeamName": radiant.get("team_name", "Unknown"),
            "RadiantTeamId": radiant.get("team_id", 0),
            "RadiantLogoTeamId": radiant.get("team_logo", 0),

            "DireTeamName": dire.get("team_name", "Unknown"),
            "DireTeamId": dire.get("team_id", 0),
            "DireLogoTeamId": dire.get("team_logo", 0),

        }
        matches.append(match_info)
    return matches


'''
Вообще есть идея сохранять весь JSON матча, для там всяких штук дальше, но надо ли
'''
def transform_steam_live_data_for_predict(game):
    scoreboard = game.get("scoreboard", {})
    duration = int(scoreboard.get("duration", 0))
    minute = duration / 60

    result = {
        "minute": minute
    }

    total_gold_radiant, total_gold_dire = 0, 0
    # --- Игроки ---
    # Radiant
    for i, player in enumerate(scoreboard.get("radiant", {}).get("players", [])):
        prefix = f"p{i}_"
        result[prefix + "hero_id"] = player.get("hero_id")
        result[prefix + "is_radiant"] = 1
        result[prefix + "gold"] = player.get("net_worth", 0)
        result[prefix + "xp"] = player.get("xp_per_min", 0) * duration // 60
        k = player.get("kills", 0)
        d = player.get("death", 0)
        a = player.get("assists", 0)
        result[prefix + "kda"] = (k+a)/max(d,1)

        total_gold_radiant += result[prefix + "gold"]


        for j in range(1, 7):
            result[prefix + f"slot_{j}"] = player.get(f"item{j-1}", None)

    # Dire
    for i, player in enumerate(scoreboard.get("dire", {}).get("players", []), start=5):
        prefix = f"p{i}_"
        result[prefix + "hero_id"] = player.get("hero_id")
        result[prefix + "is_radiant"] = 0
        result[prefix + "gold"] = player.get("net_worth", 0)
        result[prefix + "xp"] = player.get("xp_per_min", 0) * duration // 60
        k = player.get("kills", 0)
        d = player.get("death", 0)
        a = player.get("assists", 0)
        result[prefix + "kda"] = (k+a)/max(d,1)

        total_gold_dire += result[prefix + "gold"]

        for j in range(1, 7):
            result[prefix + f"slot_{j}"] = player.get(f"item{j-1}", None)

    result["assists_dire"] = scoreboard.get("dire", {}).get("score", 0)
    result["assists_radiant"] = scoreboard.get("radiant", {}).get("score", 0)

    # --- Постройки ---
    def parse_towers_by_bits(tower_state, rax_state, is_radiant=True):
        result = {}

        if is_radiant:
            # Radiant: биты 0-15
            result["radiant_bot_t1_alive"] = (tower_state >> 0) & 1
            result["radiant_bot_t2_alive"] = (tower_state >> 1) & 1
            result["radiant_bot_t3_alive"] = (tower_state >> 2) & 1

            result["radiant_mid_t1_alive"] = (tower_state >> 3) & 1
            result["radiant_mid_t2_alive"] = (tower_state >> 4) & 1
            result["radiant_mid_t3_alive"] = (tower_state >> 5) & 1

            result["radiant_top_t1_alive"] = (tower_state >> 6) & 1
            result["radiant_top_t2_alive"] = (tower_state >> 7) & 1
            result["radiant_top_t3_alive"] = (tower_state >> 8) & 1

            # Ancient (T4)
            result["radiant_unknown_t4_alive"] = (tower_state >> 8) & 1
            result["radiant_unknown_t4_2_alive"] = (tower_state >> 9) & 1


            result["radiant_bot_melee_rax_alive"]  = (rax_state >> 0) & 1
            result["radiant_bot_range_rax_alive"]  = (rax_state >> 1) & 1
            result["radiant_mid_melee_rax_alive"]  = (rax_state >> 2) & 1
            result["radiant_mid_range_rax_alive"]  = (rax_state >> 3) & 1
            result["radiant_top_melee_rax_alive"]  = (rax_state >> 4) & 1
            result["radiant_top_range_rax_alive"]  = (rax_state >> 5) & 1


        else:
            # Dire: биты 16-32
            result["dire_bot_t1_alive"] = (tower_state >> 16) & 1
            result["dire_bot_t2_alive"] = (tower_state >> 17) & 1
            result["dire_bot_t3_alive"] = (tower_state >> 18) & 1

            result["dire_mid_t1_alive"] = (tower_state >> 19) & 1
            result["dire_mid_t2_alive"] = (tower_state >> 20) & 1
            result["dire_mid_t3_alive"] = (tower_state >> 21) & 1

            result["dire_top_t1_alive"] = (tower_state >> 22) & 1
            result["dire_top_t2_alive"] = (tower_state >> 23) & 1
            result["dire_top_t3_alive"] = (tower_state >> 24) & 1

            # Ancient (T4)
            result["dire_unknown_t4_alive"] = (tower_state >> 25) & 1
            result["dire_unknown_t4_2_alive"] = (tower_state >> 26) & 1


            # Бараки: melee/range по линиям
            result["dire_bot_melee_rax_alive"]  = (rax_state >> 0) & 1
            result["dire_bot_range_rax_alive"]  = (rax_state >> 1) & 1
            result["dire_mid_melee_rax_alive"]  = (rax_state >> 2) & 1
            result["dire_mid_range_rax_alive"]  = (rax_state >> 3) & 1
            result["dire_top_melee_rax_alive"]  = (rax_state >> 4) & 1
            result["dire_top_range_rax_alive"]  = (rax_state >> 5) & 1


        return result

    # Radiant
    r_tower_state = scoreboard.get("radiant", {}).get("tower_state", 0)
    r_rax_state = scoreboard.get("radiant", {}).get("barracks_state", 0)
    result.update(parse_towers_by_bits(r_tower_state, r_rax_state, is_radiant=True))

    # Dire
    d_tower_state = scoreboard.get("dire", {}).get("tower_state", 0)
    d_rax_state = scoreboard.get("dire", {}).get("barracks_state", 0)
    result.update(parse_towers_by_bits(d_tower_state, d_rax_state, is_radiant=False))


    # --- Рошан ---
    roshan_timer = scoreboard.get("roshan_respawn_timer", 0)
    result["roshan_alive"] = 1 if roshan_timer == 0 else 0

    return game.get("match_id"), duration, result
