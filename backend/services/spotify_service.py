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

    async def get_playlist_cooccurrence(self, artist_name: str, limit: int = 15):
        token = await self.get_token()
        if not token:
            return []

        headers = {"Authorization": f"Bearer {token}"}
        search_params = {"q": f'"{artist_name}"', "type": "playlist", "limit": 10}

        async with httpx.AsyncClient() as client:
            res = await client.get("https://api.spotify.com/v1/search", headers=headers, params=search_params)
            if res.status_code != 200:
                return []

            playlists = res.json().get("playlists", {}).get("items", [])
            if not playlists:
                return []

            total_playlists = len(playlists)

            async def fetch_playlist_tracks(playlist_id):
                try:
                    p_res = await client.get(f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks?limit=40", headers=headers)
                    if p_res.status_code == 200:
                        return p_res.json().get("items", [])
                except Exception:
                    pass
                return []

            tasks = [fetch_playlist_tracks(p["id"]) for p in playlists if p and isinstance(p, dict) and "id" in p]
            playlists_tracks = await asyncio.gather(*tasks)

            artist_counts = {}
            for tracks in playlists_tracks:
                seen_in_playlist = set()
                for item in tracks:
                    if not isinstance(item, dict):
                        continue
                    track = item.get("track")
                    if not track or not isinstance(track, dict):
                        continue
                    for art in track.get("artists", []):
                        a_id = art.get("id")
                        a_name = art.get("name")
                        if a_name and a_name.lower() != artist_name.lower() and a_id not in seen_in_playlist:
                            seen_in_playlist.add(a_id)
                            if a_id not in artist_counts:
                                artist_counts[a_id] = {
                                    "id": a_id,
                                    "name": a_name,
                                    "count": 0,
                                    "genres": art.get("genres", []),
                                    "popularity": 60
                                }
                            artist_counts[a_id]["count"] += 1

            sorted_candidates = sorted(artist_counts.values(), key=lambda x: x["count"], reverse=True)
            results = []
            for item in sorted_candidates[:limit]:
                incidence_pct = round((item["count"] / max(total_playlists, 1)), 2)
                results.append({
                    "id": item["id"],
                    "name": item["name"],
                    "incidence_count": item["count"],
                    "total_playlists": total_playlists,
                    "incidence_pct": incidence_pct,
                    "genres": item.get("genres", []),
                    "popularity": item["popularity"],
                    "similarity": min(0.98, round(0.55 + (incidence_pct * 0.40), 2))
                })
            return results

spotify_service = SpotifyService()

