from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.graph_builder import build_artist_network
from services.spotify_service import spotify_service
from services.musicbrainz_service import musicbrainz_service

app = FastAPI(
    title="MusicMap API",
    description="API Backend para descubrimiento musical, red de grafos y metadatos de artistas",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "service": "MusicMap FastAPI Backend",
        "version": "1.0.0"
    }

@app.get("/api/search")
async def search_artists(q: str = Query(..., min_length=1)):
    """
    Busca sugerencias de artistas en vivo desde Spotify API
    """
    results = await spotify_service.search_artists(q, limit=6)
    if not results:
        # Generic fallback
        return [
            {"id": q.lower().replace(" ", "-"), "name": q.title(), "genres": ["Indie"], "popularity": 75}
        ]
    return results

@app.get("/api/network")
async def get_artist_network(
    artist: str = Query(..., description="Nombre o ID del artista semilla"),
    user_country: str = Query("Chile", description="País de referencia del usuario")
):
    """
    Genera el grafo de red completo de un artista combinando Spotify, Last.fm y MusicBrainz
    """
    try:
        network_data = await build_artist_network(artist, user_country=user_country)
        return network_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
