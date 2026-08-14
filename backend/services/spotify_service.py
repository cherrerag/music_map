import time
import base64
import httpx
from config import SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET

class SpotifyService:
    def __init__(self):
        self.access_token = None
        self.token_expires_at = 0

    async def get_token(self) -> str:
        if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET:
            return ""

        now = time.time()
        if self.access_token and now < self.token_expires_at - 60:
            return self.access_token

        auth_header = base64.b64encode(f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}".encode()).decode()
        headers = {
            "Authorization": f"Basic {auth_header}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {"grant_type": "client_credentials"}

        async with httpx.AsyncClient() as client:
            res = await client.post("https://accounts.spotify.com/api/token", headers=headers, data=data)
            if res.status_code == 200:
                body = res.json()
                self.access_token = body.get("access_token")
                self.token_expires_at = now + body.get("expires_in", 3600)
                return self.access_token
            else:
                print(f"[Spotify Auth Error] {res.status_code}: {res.text}")
                return ""

    async def search_artists(self, query: str, limit: int = 5):
        token = await self.get_token()
        if not token:
            return []

        headers = {"Authorization": f"Bearer {token}"}
        params = {"q": query, "type": "artist", "limit": limit}

        async with httpx.AsyncClient() as client:
            res = await client.get("https://api.spotify.com/v1/search", headers=headers, params=params)
            if res.status_code == 200:
                items = res.json().get("artists", {}).get("items", [])
                results = []
                for item in items:
                    results.append({
                        "id": item.get("id"),
                        "name": item.get("name"),
                        "genres": item.get("genres", []),
                        "popularity": item.get("popularity", 50),
                        "image": item.get("images", [{}])[0].get("url") if item.get("images") else None,
                        "spotify_url": item.get("external_urls", {}).get("spotify")
                    })
                return results
            return []

    async def get_artist_details(self, artist_id: str):
        token = await self.get_token()
        if not token:
            return None

        headers = {"Authorization": f"Bearer {token}"}
        async with httpx.AsyncClient() as client:
            res = await client.get(f"https://api.spotify.com/v1/artists/{artist_id}", headers=headers)
            if res.status_code == 200:
                item = res.json()
                return {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "genres": item.get("genres", []),
                    "popularity": item.get("popularity", 50),
                    "image": item.get("images", [{}])[0].get("url") if item.get("images") else None,
                    "spotify_url": item.get("external_urls", {}).get("spotify")
                }
            return None

    async def get_related_artists(self, artist_id: str):
        token = await self.get_token()
        if not token:
            return []

        headers = {"Authorization": f"Bearer {token}"}
        async with httpx.AsyncClient() as client:
            res = await client.get(f"https://api.spotify.com/v1/artists/{artist_id}/related-artists", headers=headers)
            if res.status_code == 200:
                items = res.json().get("artists", [])
                results = []
                for item in items:
                    results.append({
                        "id": item.get("id"),
                        "name": item.get("name"),
                        "genres": item.get("genres", []),
                        "popularity": item.get("popularity", 50),
                        "image": item.get("images", [{}])[0].get("url") if item.get("images") else None
                    })
                return results
            return []

    async def get_top_tracks(self, artist_id: str, market: str = "US"):
        token = await self.get_token()
        if not token:
            return []

        headers = {"Authorization": f"Bearer {token}"}
        async with httpx.AsyncClient() as client:
            res = await client.get(f"https://api.spotify.com/v1/artists/{artist_id}/top-tracks?market={market}", headers=headers)
            if res.status_code == 200:
                items = res.json().get("tracks", [])
                results = []
                for item in items[:3]:
                    results.append({
                        "title": item.get("name"),
                        "album": item.get("album", {}).get("name"),
                        "duration": "0:30",
                        "previewUrl": item.get("preview_url") or "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                    })
                return results
            return []

spotify_service = SpotifyService()
