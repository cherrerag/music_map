import time
import base64
import httpx
from config import TIDAL_CLIENT_ID, TIDAL_CLIENT_SECRET

class TidalService:
    def __init__(self):
        self.access_token = None
        self.token_expires_at = 0

    async def get_token(self) -> str:
        if not TIDAL_CLIENT_ID or not TIDAL_CLIENT_SECRET:
            return ""

        now = time.time()
        if self.access_token and now < self.token_expires_at - 60:
            return self.access_token

        auth_header = base64.b64encode(f"{TIDAL_CLIENT_ID}:{TIDAL_CLIENT_SECRET}".encode()).decode()
        headers = {
            "Authorization": f"Basic {auth_header}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {"grant_type": "client_credentials"}

        async with httpx.AsyncClient() as client:
            try:
                res = await client.post("https://auth.tidal.com/v1/oauth2/token", headers=headers, data=data, timeout=5.0)
                if res.status_code == 200:
                    body = res.json()
                    self.access_token = body.get("access_token")
                    self.token_expires_at = now + body.get("expires_in", 86400)
                    return self.access_token
            except Exception as e:
                print(f"[TIDAL Auth Error] {e}")
        return ""

    def get_tidal_url(self, artist_name: str) -> str:
        """
        Genera el enlace web directo a la página de búsqueda/artista en TIDAL
        """
        encoded_name = httpx.URL(f"https://tidal.com/search?q={artist_name}").params.get("q")
        return f"https://listen.tidal.com/search?q={encoded_name}"

    async def search_artists(self, query: str, limit: int = 5):
        token = await self.get_token()
        headers = {"Authorization": f"Bearer {token}"} if token else {}

        async with httpx.AsyncClient() as client:
            try:
                # TIDAL OpenAPI or fallback search
                url = "https://openapi.tidal.com/v2/search/artists"
                params = {"query": query, "countryCode": "CL", "limit": limit}
                res = await client.get(url, headers=headers, params=params, timeout=5.0)
                if res.status_code == 200:
                    items = res.json().get("data", [])
                    results = []
                    for item in items:
                        results.append({
                            "id": item.get("id"),
                            "name": item.get("attributes", {}).get("name"),
                            "popularity": item.get("attributes", {}).get("popularity", 75),
                            "tidal_url": f"https://listen.tidal.com/artist/{item.get('id')}"
                        })
                    return results
            except Exception as e:
                print(f"[TIDAL Search Error] {e}")
        
        # Default fallback Tidal URL builder
        return [{
            "id": query.lower().replace(" ", "-"),
            "name": query.title(),
            "tidal_url": f"https://listen.tidal.com/search?q={query}"
        }]

tidal_service = TidalService()
