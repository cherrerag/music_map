import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file if present
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID", "")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET", "")
LASTFM_API_KEY = os.getenv("LASTFM_API_KEY", "b25b959554ed76058ac220b7b2e0a026")

TIDAL_CLIENT_ID = os.getenv("TIDAL_CLIENT_ID", "")
TIDAL_CLIENT_SECRET = os.getenv("TIDAL_CLIENT_SECRET", "")

# MusicBrainz User-Agent requirement
USER_AGENT = "MusicMapMVP/1.0 (claudioherreram5@gmail.com)"
