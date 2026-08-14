import httpx
import asyncio

class AudioService:
    BASE_URL = "https://itunes.apple.com/search"

    def __init__(self):
        self.cache = {}

    async def get_real_audio_preview(self, artist_name: str, track_title: str) -> str:
        cache_key = f"{artist_name}:{track_title}".lower()
        if cache_key in self.cache:
            return self.cache[cache_key]

        params = {
            "term": f"{artist_name} {track_title}",
            "entity": "song",
            "limit": 1
        }

        async with httpx.AsyncClient() as client:
            try:
                res = await client.get(self.BASE_URL, params=params, timeout=4.0)
                if res.status_code == 200:
                    results = res.json().get("results", [])
                    if results:
                        preview_url = results[0].get("previewUrl", "")
                        if preview_url:
                            self.cache[cache_key] = preview_url
                            return preview_url
            except Exception as e:
                print(f"[AudioService Error] {e}")

        # Fallback to general artist search
        params_artist = {
            "term": artist_name,
            "entity": "song",
            "limit": 1
        }
        async with httpx.AsyncClient() as client:
            try:
                res = await client.get(self.BASE_URL, params=params_artist, timeout=4.0)
                if res.status_code == 200:
                    results = res.json().get("results", [])
                    if results:
                        preview_url = results[0].get("previewUrl", "")
                        if preview_url:
                            self.cache[cache_key] = preview_url
                            return preview_url
            except Exception as e:
                print(f"[AudioService Fallback Error] {e}")

        return ""

audio_service = AudioService()
