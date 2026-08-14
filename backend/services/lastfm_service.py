import httpx
from config import LASTFM_API_KEY

class LastFMService:
    BASE_URL = "https://ws.audioscrobbler.com/2.0/"

    async def get_similar_artists(self, artist_name: str, limit: int = 10):
        if not LASTFM_API_KEY:
            return []

        params = {
            "method": "artist.getsimilar",
            "artist": artist_name,
            "api_key": LASTFM_API_KEY,
            "format": "json",
            "limit": limit
        }

        async with httpx.AsyncClient() as client:
            try:
                res = await client.get(self.BASE_URL, params=params, timeout=5.0)
                if res.status_code == 200:
                    data = res.json()
                    similar = data.get("similarartists", {}).get("artist", [])
                    results = []
                    for item in similar:
                        match_score = float(item.get("match", 0.7))
                        results.append({
                            "name": item.get("name"),
                            "match": match_score
                        })
                    return results
            except Exception as e:
                print(f"[Last.fm Error] {e}")
        return []

    async def get_top_tags(self, artist_name: str):
        if not LASTFM_API_KEY:
            return []

        params = {
            "method": "artist.gettoptags",
            "artist": artist_name,
            "api_key": LASTFM_API_KEY,
            "format": "json"
        }

        async with httpx.AsyncClient() as client:
            try:
                res = await client.get(self.BASE_URL, params=params, timeout=5.0)
                if res.status_code == 200:
                    tags = res.json().get("toptags", {}).get("tag", [])
                    return [t.get("name") for t in tags[:5] if t.get("name")]
            except Exception as e:
                print(f"[Last.fm Tags Error] {e}")
        return []

lastfm_service = LastFMService()
