import asyncio
from services.spotify_service import spotify_service
from services.lastfm_service import lastfm_service
from services.musicbrainz_service import musicbrainz_service

# Flag mappings for countries
FLAG_MAP = {
    "Chile": "🇨🇱", "CL": "🇨🇱",
    "Argentina": "🇦🇷", "AR": "🇦🇷",
    "México": "🇲🇽", "Mexico": "🇲🇽", "MX": "🇲🇽",
    "España": "🇪🇸", "Spain": "🇪🇸", "ES": "🇪🇸",
    "United States": "🇺🇸", "US": "🇺🇸",
    "United Kingdom": "🇬🇧", "GB": "🇬🇧", "UK": "🇬🇧",
    "Australia": "🇦🇺", "AU": "🇦🇺",
    "Brazil": "🇧🇷", "BR": "🇧🇷",
    "Colombia": "🇨🇴", "CO": "🇨🇴",
    "Peru": "🇵🇪", "PE": "🇵🇪",
    "Uruguay": "🇺🇾", "UY": "🇺🇾"
}

def get_flag(country: str, country_code: str = "") -> str:
    if country_code in FLAG_MAP:
        return FLAG_MAP[country_code]
    if country in FLAG_MAP:
        return FLAG_MAP[country]
    return "🎵"

async def build_artist_network(seed_query: str, user_country: str = "Chile"):
    # 1. Search for seed artist in Spotify
    spotify_search = await spotify_service.search_artists(seed_query, limit=1)
    
    if spotify_search:
        seed = spotify_search[0]
        seed_id = seed["id"]
        seed_name = seed["name"]
    else:
        # Fallback seed
        seed_name = seed_query.title()
        seed_id = seed_query.lower().replace(" ", "-")
        seed = {
            "id": seed_id,
            "name": seed_name,
            "genres": ["Rock", "Alternative"],
            "popularity": 85,
            "image": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80"
        }

    # Parallel retrieval of details, origin, related, and similar
    spotify_related_task = spotify_service.get_related_artists(seed_id) if spotify_search else asyncio.sleep(0, result=[])
    lastfm_similar_task = lastfm_service.get_similar_artists(seed_name, limit=8)
    origin_task = musicbrainz_service.get_artist_origin(seed_name)
    top_tracks_task = spotify_service.get_top_tracks(seed_id) if spotify_search else asyncio.sleep(0, result=[])

    related_spotify, similar_lastfm, origin_mb, top_tracks = await asyncio.gather(
        spotify_related_task, lastfm_similar_task, origin_task, top_tracks_task
    )

    seed_country = origin_mb.get("country", "Desconocido")
    seed_city = origin_mb.get("city", "Escena Local")
    seed_flag = get_flag(seed_country, origin_mb.get("country_code", ""))

    nodes = [{
        "id": seed_id,
        "name": seed_name,
        "country": seed_country,
        "city": seed_city,
        "flag": seed_flag,
        "genres": seed.get("genres", ["Alternative"]),
        "popularity": seed.get("popularity", 85),
        "image": seed.get("image") or "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
        "isSeed": True,
        "isLocal": seed_country == user_country or seed_country in ["Chile", "CL"],
        "topTracks": top_tracks or [
          {"title": f"Single Principal - {seed_name}", "album": "Hits", "duration": "0:30", "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}
        ]
    }]

    links = []
    
    # Process candidates from Spotify Related & Last.fm
    candidates = {}

    for item in related_spotify:
        cand_id = item["id"]
        candidates[cand_id] = {
            "id": cand_id,
            "name": item["name"],
            "genres": item.get("genres", []),
            "popularity": item.get("popularity", 60),
            "image": item.get("image"),
            "similarity": 0.85
        }

    for item in similar_lastfm:
        c_name = item["name"]
        c_id = c_name.lower().replace(" ", "-")
        match_score = item["match"]

        if c_id not in candidates:
            candidates[c_id] = {
                "id": c_id,
                "name": c_name,
                "genres": ["Indie", "Alternative"],
                "popularity": int(match_score * 100),
                "image": f"https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
                "similarity": round(match_score, 2)
            }
        else:
            candidates[c_id]["similarity"] = round(max(candidates[c_id]["similarity"], match_score), 2)

    # Resolve origins for top candidates
    candidate_list = list(candidates.values())[:10]
    for cand in candidate_list:
        cand_origin = await musicbrainz_service.get_artist_origin(cand["name"])
        c_country = cand_origin.get("country", "Desconocido")
        c_city = cand_origin.get("city", "Escena Local")
        c_flag = get_flag(c_country, cand_origin.get("country_code", ""))

        nodes.append({
            "id": cand["id"],
            "name": cand["name"],
            "country": c_country,
            "city": c_city,
            "flag": c_flag,
            "genres": cand["genres"],
            "popularity": cand["popularity"],
            "image": cand["image"] or "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
            "isSeed": False,
            "isLocal": c_country == user_country or c_country in ["Chile", "CL"],
            "topTracks": [
              {"title": f"Hits - {cand['name']}", "album": "Single", "duration": "0:30", "previewUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"}
            ]
        })

        links.append({
            "source": seed_id,
            "target": cand["id"],
            "weight": cand["similarity"]
        })

    return {
        "seed": seed_name,
        "nodes": nodes,
        "links": links
    }
