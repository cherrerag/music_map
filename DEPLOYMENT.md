# 🚀 Guía de Despliegue en Producción - MusicMap

Esta guía detalla las opciones y pasos recomendados para desplegar **MusicMap** en internet.

---

## 🛠️ Opción 1: Despliegue con Docker Compose (Servidor VPS / Local)

Si dispones de un servidor VPS (Ubuntu, Debian, EC2, DigitalOcean, Hetzner, etc.):

```bash
# 1. Clonar el repositorio en el servidor
git clone https://github.com/tu-usuario/music_map.git
cd music_map

# 2. Configurar variables de entorno (opcional)
cp backend/.env.example backend/.env

# 3. Construir y levantar contenedores en segundo plano
docker compose up -d --build
```
- Frontend activo en: `http://IP_DEL_SERVIDOR:3000`
- Backend activo en: `http://IP_DEL_SERVIDOR:8000`

---

## ☁️ Opción 2: Despliegue Gratuito en la Nube (Vercel + Render / Railway)

### 1. Frontend en Vercel (Gratis)
1. Conecta tu repositorio de GitHub a [Vercel](https://vercel.com).
2. En la configuración del proyecto:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Agrega la Variable de Entorno:
   - `VITE_API_URL` = URL de tu backend desplegado (ej. `https://musicmap-backend.onrender.com`)
4. Haz clic en **Deploy**.

### 2. Backend FastAPI en Render / Railway / Fly.io (Gratis)
1. Crea un nuevo **Web Service** en [Render](https://render.com) conectando tu repo.
2. Configura los parámetros:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Variables de entorno opcionales:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `LASTFM_API_KEY`
4. Haz clic en **Create Web Service**.

---

## 🔒 Variables de Entorno Recomendadas

| Variable | Dónde definir | Descripción |
| :--- | :--- | :--- |
| `VITE_API_URL` | Frontend (`.env` o Vercel) | URL base del servidor FastAPI |
| `SPOTIFY_CLIENT_ID` | Backend (`backend/.env` o Render) | Client ID oficial de Spotify Developer |
| `SPOTIFY_CLIENT_SECRET` | Backend (`backend/.env` o Render) | Client Secret oficial de Spotify |
| `LASTFM_API_KEY` | Backend (`backend/.env` o Render) | API Key de Last.fm Web Services |

---

## ✅ Verificación de Despliegue
Una vez desplegado:
1. Revisa el endpoint de salud del backend: `https://tu-backend.onrender.com/api/health`
2. Verifica que el frontend cargue la constelación sin errores de CORS.
