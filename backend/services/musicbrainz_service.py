import httpx
import asyncio
from config import USER_AGENT

class MusicBrainzService:
    BASE_URL = "https://musicbrainz.org/ws/2/artist"

    def __init__(self):
        self.cache = {}

    async def get_artist_origin(self, artist_name: str):
        if artist_name in self.cache:
            return self.cache[artist_name]

        headers = {"User-Agent": USER_AGENT}
        params = {
            "query": f'artist:"{artist_name}"',
            "fmt": "json",
            "limit": 1
        }

        async with httpx.AsyncClient() as client:
            try:
                res = await client.get(self.BASE_URL, headers=headers, params=params, timeout=4.0)
                if res.status_code == 200:
                    artists = res.json().get("artists", [])
                    if artists:
                        artist = artists[0]
                        country = artist.get("country", "")
                        area = artist.get("area", {}).get("name", "")
                        begin_area = artist.get("begin-area", {}).get("name", "")
                        
                        origin = {
                            "country": country or area or "Desconocido",
                            "city": begin_area or area or "Escena Local",
                            "country_code": country
                        }
                        self.cache[artist_name] = origin
                        return origin
            except Exception as e:
                print(f"[MusicBrainz Error] {e}")

        default_origin = {"country": "Desconocido", "city": "Escena Local", "country_code": ""}
        self.cache[artist_name] = default_origin
        return default_origin

musicbrainz_service = MusicBrainzService()
