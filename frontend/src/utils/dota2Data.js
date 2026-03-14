// Dota 2 Heroes and Items data - loaded from Steam API
let HERO_MAP = {};
let ITEM_MAP = {};

// Fetch heroes and items from API on module load
export async function loadHeroes() {
    try {
        const response = await fetch('/api/heroes');
        const data = await response.json();
        HERO_MAP = data.heroes || {};
        return HERO_MAP;
    } catch (error) {
        console.error('Failed to load heroes:', error);
        return {};
    }
}

export async function loadItems() {
    try {
        const response = await fetch('/api/items');
        const data = await response.json();
        ITEM_MAP = data.items || {};
        return ITEM_MAP;
    } catch (error) {
        console.error('Failed to load items:', error);
        return {};
    }
}

// Initialize all data from API
export async function loadDotaData() {
    await Promise.all([loadHeroes(), loadItems()]);
}

// Fallback hero names
const FALLBACK_HEROES = {
    1: "antimage", 2: "axe", 3: "bane", 4: "bloodseeker", 5: "crystal_maiden",
    6: "drow_ranger", 7: "earthshaker", 8: "juggernaut", 9: "mirana", 10: "morphling",
    11: "nevermore", 12: "phantom_lancer", 13: "puck", 14: "pudge", 15: "razor",
    16: "sand_king", 17: "storm_spirit", 18: "sven", 19: "tiny", 20: "vengefulspirit",
    21: "windrunner", 22: "zeus", 23: "kunkka", 25: "lina", 26: "lion",
    27: "shadow_shaman", 28: "slardar", 29: "tidehunter", 30: "witch_doctor", 31: "lich",
    32: "riki", 33: "enigma", 34: "tinker", 35: "sniper", 36: "necrolyte",
    37: "warlock", 38: "beastmaster", 39: "queenofpain", 40: "venomancer", 41: "faceless_void",
    42: "skeleton_king", 43: "death_prophet", 44: "phantom_assassin", 45: "pugna", 46: "templar_assassin",
    47: "viper", 48: "luna", 49: "dragon_knight", 50: "dazzle", 51: "rattletrap",
    52: "leshrac", 53: "furion", 54: "life_stealer", 55: "dark_seer", 56: "clinkz",
    57: "omniknight", 58: "enchantress", 59: "huskar", 60: "night_stalker", 61: "broodmother",
    62: "bounty_hunter", 63: "weaver", 64: "jakiro", 65: "batrider", 66: "chen",
    67: "spectre", 68: "ancient_apparition", 69: "doom_bringer", 70: "ursa", 71: "spirit_breaker",
    72: "gyrocopter", 73: "alchemist", 74: "invoker", 75: "silencer", 76: "obsidian_destroyer",
    77: "lycan", 78: "brewmaster", 79: "shadow_demon", 80: "lone_druid", 81: "chaos_knight",
    82: "meepo", 83: "treant", 84: "ogre_magi", 85: "undying", 86: "rubick",
    87: "disruptor", 88: "nyx_assassin", 89: "naga_siren", 90: "keeper_of_the_light", 91: "wisp",
    92: "visage", 93: "slark", 94: "medusa", 95: "troll_warlord", 96: "centaur",
    97: "magnataur", 98: "shredder", 99: "bristleback", 100: "tusk", 101: "skywrath_mage",
    102: "abaddon", 103: "elder_titan", 104: "legion_commander", 105: "techies", 106: "ember_spirit",
    107: "earth_spirit", 108: "abyssal_underlord", 109: "terrorblade", 110: "phoenix", 111: "oracle",
    112: "winter_wyvern", 113: "arc_warden", 114: "monkey_king",
};

const HERO_NAMES = {
    "antimage": "Anti-Mage", "axe": "Axe", "bane": "Bane", "bloodseeker": "Bloodseeker",
    "crystal_maiden": "Crystal Maiden", "drow_ranger": "Drow Ranger", "earthshaker": "Earthshaker",
    "juggernaut": "Juggernaut", "mirana": "Mirana", "morphling": "Morphling", "nevermore": "Shadow Fiend",
    "phantom_lancer": "Phantom Lancer", "puck": "Puck", "pudge": "Pudge", "razor": "Razor",
    "sand_king": "Sand King", "storm_spirit": "Storm Spirit", "sven": "Sven", "tiny": "Tiny",
    "vengefulspirit": "Vengeful Spirit", "windrunner": "Windranger", "zeus": "Zeus", "kunkka": "Kunkka",
    "lina": "Lina", "lion": "Lion", "shadow_shaman": "Shadow Shaman", "slardar": "Slardar",
    "tidehunter": "Tidehunter", "witch_doctor": "Witch Doctor", "lich": "Lich", "riki": "Riki",
    "enigma": "Enigma", "tinker": "Tinker", "sniper": "Sniper", "necrolyte": "Necrophos",
    "warlock": "Warlock", "beastmaster": "Beastmaster", "queenofpain": "Queen of Pain",
    "venomancer": "Venomancer", "faceless_void": "Faceless Void", "skeleton_king": "Wraith King",
    "death_prophet": "Death Prophet", "phantom_assassin": "Phantom Assassin", "pugna": "Pugna",
    "templar_assassin": "Templar Assassin", "viper": "Viper", "luna": "Luna", "dragon_knight": "Dragon Knight",
    "dazzle": "Dazzle", "rattletrap": "Clockwerk", "leshrac": "Leshrac", "furion": "Nature's Prophet",
    "life_stealer": "Lifestealer", "dark_seer": "Dark Seer", "clinkz": "Clinkz", "omniknight": "Omniknight",
    "enchantress": "Enchantress", "huskar": "Huskar", "night_stalker": "Night Stalker",
    "broodmother": "Broodmother", "bounty_hunter": "Bounty Hunter", "weaver": "Weaver", "jakiro": "Jakiro",
    "batrider": "Batrider", "chen": "Chen", "spectre": "Spectre", "ancient_apparition": "Ancient Apparition",
    "doom_bringer": "Doom", "ursa": "Ursa", "spirit_breaker": "Spirit Breaker", "gyrocopter": "Gyrocopter",
    "alchemist": "Alchemist", "invoker": "Invoker", "silencer": "Silencer",
    "obsidian_destroyer": "Outworld Destroyer", "lycan": "Lycan", "brewmaster": "Brewmaster",
    "shadow_demon": "Shadow Demon", "lone_druid": "Lone Druid", "chaos_knight": "Chaos Knight",
    "meepo": "Meepo", "treant": "Treant Protector", "ogre_magi": "Ogre Magi", "undying": "Undying",
    "rubick": "Rubick", "disruptor": "Disruptor", "nyx_assassin": "Nyx Assassin", "naga_siren": "Naga Siren",
    "keeper_of_the_light": "Keeper of the Light", "wisp": "Io", "visage": "Visage", "slark": "Slark",
    "medusa": "Medusa", "troll_warlord": "Troll Warlord", "centaur": "Centaur Warrunner",
    "magnataur": "Magnus", "shredder": "Timbersaw", "bristleback": "Bristleback", "tusk": "Tusk",
    "skywrath_mage": "Skywrath Mage", "abaddon": "Abaddon", "elder_titan": "Elder Titan",
    "legion_commander": "Legion Commander", "techies": "Techies", "ember_spirit": "Ember Spirit",
    "earth_spirit": "Earth Spirit", "abyssal_underlord": "Underlord", "terrorblade": "Terrorblade",
    "phoenix": "Phoenix", "oracle": "Oracle", "winter_wyvern": "Winter Wyvern", "arc_warden": "Arc Warden",
    "monkey_king": "Monkey King",
};

export function getHeroName(heroId) {
    if (HERO_MAP[heroId]?.name) {
        const name = HERO_MAP[heroId].name;
        return HERO_NAMES[name] || name.replace(/_/g, ' ');
    }
    const heroKey = FALLBACK_HEROES[heroId];
    if (!heroKey) return `Hero ${heroId}`;
    return HERO_NAMES[heroKey] || heroKey.replace(/_/g, ' ');
}

export function getHeroKey(heroId) {
    if (HERO_MAP[heroId]?.name) {
        return HERO_MAP[heroId].name;
    }
    return FALLBACK_HEROES[heroId] || null;
}

export function getItemName(itemId) {
    if (itemId === null || itemId === undefined || itemId === -1 || itemId === 0) {
        return null;
    }
    if (ITEM_MAP[itemId]?.name) {
        return ITEM_MAP[itemId].name;
    }
    return `item_${itemId}`;
}

export function getItemKey(itemId) {
    if (itemId === null || itemId === undefined || itemId === -1 || itemId === 0) {
        return null;
    }
    if (ITEM_MAP[itemId]?.name) {
        return ITEM_MAP[itemId].name;
    }
    return null;
}

export function getHeroImage(heroId, size = 'lg') {
    const heroKey = getHeroKey(heroId);
    if (!heroKey) return null;
    
    if (size === 'sm') {
        return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/${heroKey}.png`;
    }
    return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroKey}.png`;
}

export function getItemImage(itemId) {
    const itemKey = getItemKey(itemId);
    if (!itemKey) return null;
    return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${itemKey}.png`;
}

// Get team logo from OpenDota API via backend
export async function getTeamLogo(teamId) {
    if (!teamId || teamId === '0' || teamId === 0) return null;
    
    try {
        const response = await fetch(`/api/teams/${teamId}/logo`);
        const data = await response.json();
        return data.logo_url || null;
    } catch (error) {
        console.error('Failed to load team logo:', error);
        return null;
    }
}

// Initialize data on module load
loadDotaData();
