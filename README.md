# 🎵 MusicMap - Constelación de Descubrimiento Musical

**MusicMap** es una aplicación web interactiva diseñada para explorar relaciones entre artistas mediante un **grafo de red visual (constelación de nodos)** que combina similitud de género, origen geográfico (escena local vs. global) y previsualización de audio en tiempo real.

---

## 📌 Guía de Retoma Rápida para Futuras Sesiones

Si abres una nueva sesión o chat en el IDE, sigue estos pasos para reanudar el proyecto rápidamente:

### 1. Comandos de Inicio Rápidos
```bash
# 1. Iniciar servidor FastAPI Backend en puerto 8000
source backend/venv/bin/activate
python backend/main.py

# 2. Iniciar cliente Frontend Vite en puerto 3000
npm run dev -- --port 3000
```
- **Aplicación Frontend:** `http://localhost:3000/`
- **Documentación API Backend (Swagger UI):** `http://localhost:8000/docs`

---

## 📂 Estructura del Código

```text
music_map/
├── PDR_musicmap                 # Documento de Requerimientos y Hoja de Ruta
├── README.md                    # Bitácora, Guía de Retoma y Registro de Deudas (Este archivo)
├── DEPLOYMENT.md                # Guía paso a paso para Vercel, Render y Docker
├── vercel.json                  # Configuración de compilación y SPA routing para Vercel
├── render.yaml                  # Blueprint para despliegue automático del backend en Render
├── docker-compose.yml           # Orquestador Docker Compose para servidor VPS / Local
├── backend/                     # Servidor FastAPI en Python
│   ├── main.py                  # Endpoints REST (/api/health, /api/search, /api/network)
│   ├── config.py                # Carga de credenciales y variables de entorno
│   ├── requirements.txt         # Dependencias (fastapi, uvicorn, httpx, python-dotenv)
│   ├── .env.example             # Plantilla de credenciales (TIDAL, Last.fm, Spotify)
│   └── services/
│       ├── tidal_service.py     # Integración nativa con TIDAL API y enlaces de reproducción
│       ├── spotify_service.py   # Client Credentials Flow & búsqueda de artistas
│       ├── lastfm_service.py    # Similitud y subgéneros (artist.getSimilar)
│       ├── musicbrainz_service.py # Origen enciclopédico (país/ciudad) con caché
│       └── graph_builder.py     # Ensamblador del grafo de nodos y conexiones
└── src/
    ├── App.jsx                  # Orquestador principal (fetch al backend + fallback local)
    ├── index.css                # Sistema de diseño Space Dark, Neon y Glassmorphic
    ├── components/
    │   ├── NetworkGraph.jsx     # Motor de físicas 2D Canvas con d3-force
    │   ├── ArtistSidebar.jsx    # Ficha de artista (Botón TIDAL 🌊, HTML5 Audio y Expandir Red)
    │   └── HeaderControl.jsx    # Navbar, buscador autocomplete en vivo y controles del grafo
    └── data/
        └── musicData.js         # Dataset simulado de fallback y helper de metadatos
```

---

## 📑 Bitácora de Avances

### 🟢 Fase 1: Definición de PDR (Completado)
- Creación y depuración del archivo `PDR_musicmap`.
- Definición de arquitectura de datos (TIDAL, Last.fm, MusicBrainz, Spotify) y esquema de nodos `Artist`.

### 🟢 Fase 2: Prototipo Frontend Local (Completado)
- [x] **Grafo de Red Interactivo (D3-Force + Canvas 2D):** Atracción, repulsión, arrastre de nodos, zoom y panorámica.
- [x] **Diseño Visual Space Dark:** Nodos coloreados según tipo (Violeta para Semilla, Esmeralda para Local, Rosa para Global).
- [x] **Filtros Dinámicos:** Slider de % de afinidad mínima y Toggle "Solo Escena Local".
- [x] **Panel Lateral (ArtistSidebar):** Ficha con popularidad, etiquetas, bio y botón para expandir la red dinámicamente.
- [x] **Motor de Audio Preview HTML5:** Reproductor de clips de 30s con barra de progreso, control de mute y lista de top canciones.
- [x] **Repositorio Git:** Inicializado con commit raíz en rama `main`.

### 🟢 Fase 3: Integración de Backend FastAPI & TIDAL (Completado)
- [x] **Backend FastAPI:** Estructurado en `backend/` con soporte para CORS y endpoints REST.
- [x] **Cliente TIDAL API:** Enlaces directos a la app/web de TIDAL (`Escuchar en TIDAL 🌊`) y cliente en `backend/services/tidal_service.py`.
- [x] **Cliente Last.fm API:** Obtención de similitudes reales (`artist.getSimilar`) y subgéneros (`artist.getTopTags`).
- [x] **Cliente MusicBrainz API:** Resolución de países y ciudades de origen con sistema de caché en memoria.
- [x] **Conexión Frontend:** `src/App.jsx` y `src/components/HeaderControl.jsx` consultan el backend en vivo con fallback transparente.

### 🟢 Fase 4: Preparación para Despliegue en Producción (Completado)
- [x] **Soporte Vercel:** Creado `vercel.json` para enrutamiento SPA automático.
- [x] **Soporte Render:** Creado `render.yaml` Blueprint para despliegue sin configuración manual del backend en Render.
- [x] **Containerización Docker:** Creados `Dockerfile` (Multi-stage Node+Nginx para Frontend) y `backend/Dockerfile` (Python slim).
- [x] **Orquestador Docker Compose:** Archivo `docker-compose.yml` para ejecutar toda la pila con `docker compose up -d`.
- [x] **Guía de Despliegue:** Documento `DEPLOYMENT.md` actualizado.

---

## 🛠️ Registro de Deuda Técnica y Backlog

| ID | Área | Descripción / Desafío Técnico | Prioridad | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **TD-01** | **Credenciales API** | Agregar tus propias llaves en `backend/.env` (duplicando `backend/.env.example`) para consultar cuotas completas de Spotify y Last.fm. | Alta | Listo (Opcional) |
| **TD-02** | **CORS & Rate Limiting** | MusicBrainz e IP pública limitan peticiones por segundo. Implementada caché en memoria en `musicbrainz_service.py`. | Media | Resuelto |
| **TD-03** | **Audio Previews Fallback** | Si Spotify deprecara preview_url en una región determinada, el backend aplica fallback automático a muestras MP3 públicas. | Alta | Resuelto |
| **TD-04** | **Rendimiento Canvas** | Cuando el grafo supera los 100 nodos simultáneos, ajustar el alfa de desintegración (`alphaDecay`) en `d3-force` para congelar físicas y mantener 60 FPS. | Media | Pendiente |

---

## 💡 Instrucciones para la Inteligencia Artificial (AI Context)
Cuando retomes la conversación en un nuevo chat:
1. Revisa `README.md` y `PDR_musicmap` para entender el punto exacto de avance.
2. Ejecuta `git status` para comprobar si hay cambios pendientes antes de proponer código.
3. El backend corre en `http://localhost:8000/` y el frontend en `http://localhost:3000/`.

