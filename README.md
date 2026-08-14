# 🎵 MusicMap - Constelación de Descubrimiento Musical

**MusicMap** es una aplicación web interactiva diseñada para explorar relaciones entre artistas mediante un **grafo de red visual (constelación de nodos)** que combina similitud de género, origen geográfico (escena local vs. global) y previsualización de audio en tiempo real.

---

## 📌 Guía de Retoma Rápida para Futuras Sesiones

Si abres una nueva sesión o chat en el IDE, sigue estos pasos para reanudar el proyecto rápidamente:

### 1. Comandos de Inicio Rápidos
```bash
# Navegar al proyecto (si no estás dentro)
cd ~/dev/music_map

# Verificar estado de Git
git status

# Iniciar servidor de desarrollo en puerto 3000
npm run dev -- --port 3000
```
La aplicación estará disponible de inmediato en: **`http://localhost:3000/`**

---

## 📂 Estructura del Código

```text
music_map/
├── PDR_musicmap                 # Documento de Requerimientos y Hoja de Ruta
├── README.md                    # Bitácora, Guía de Retoma y Registro de Deudas (Este archivo)
├── index.html                   # HTML base de la aplicación
├── package.json                 # Dependencias (React 18, Vite, Lucide-React, D3-Force)
├── vite.config.js               # Configuración del empaquetador Vite
└── src/
    ├── App.jsx                  # Orquestador principal de estado y filtros
    ├── index.css                # Sistema de diseño Space Dark, Neon y Glassmorphic
    ├── components/
    │   ├── NetworkGraph.jsx     # Motor de físicas 2D Canvas con d3-force
    │   ├── ArtistSidebar.jsx    # Ficha técnica de artista, motor HTML5 Audio y botón Expandir Red
    │   └── HeaderControl.jsx    # Navbar, buscador autocomplete y controles del grafo
    └── data/
        └── musicData.js         # Dataset simulado de fallback y helper de metadatos
```

---

## 📑 Bitácora de Avances

### 🟢 Fase 1: Definición de PDR (Completado)
- Creación y depuración del archivo `PDR_musicmap`.
- Definición de arquitectura de datos (Spotify, Last.fm, MusicBrainz) y esquema de nodos `Artist` y relaciones `SIMILAR_TO`.

### 🟢 Fase 2: Prototipo Frontend Local (Completado)
- [x] **Grafo de Red Interactivo (D3-Force + Canvas 2D):** Atracción, repulsión, arrastre de nodos, zoom y panorámica.
- [x] **Diseño Visual Space Dark:** Nodos coloreados según tipo (Violeta para Semilla, Esmeralda para Local, Rosa para Global).
- [x] **Filtros Dinámicos:** Slider de % de afinidad mínima y Toggle "Solo Escena Local".
- [x] **Panel Lateral (ArtistSidebar):** Ficha con popularidad, etiquetas, bio y botón para expandir la red dinámicamente.
- [x] **Motor de Audio Preview HTML5:** Reproductor de clips de 30s con barra de progreso, control de mute y lista de top canciones.
- [x] **Repositorio Git:** Inicializado con commit raíz en rama `main`.

### 🟡 Fase 3: Integración de APIs Reales (En Progreso)
- [ ] Implementador de cliente de Spotify Web API (Búsqueda real + Client Credentials Flow / PKCE).
- [ ] Integración con Last.fm API (`artist.getSimilar`, `artist.getTopTags`).
- [ ] Integración con MusicBrainz API para resolver ciudad y país de origen exacto.

---

## 🛠️ Registro de Deuda Técnica y Backlog

| ID | Área | Descripción / Desafío Técnico | Prioridad | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **TD-01** | **Autenticación Spotify** | Implementar Client Credentials Flow para token de Spotify. Evitar exponer `CLIENT_SECRET` en el frontend usando un backend liviano en FastAPI o un Proxy en Vite/Serverless. | Alta | Pendiente |
| **TD-02** | **CORS & Rate Limiting** | MusicBrainz y Last.fm limitan rps (requests por segundo). Implementar caché en memoria/sessionStorage para no saturar endpoints. | Media | Pendiente |
| **TD-03** | **Audio Previews Spotify** | Spotify ha estado deprecando `preview_url` directos para algunas regiones/tracks en su API pública v1. Tener fallback de audio con Deezer / SoundHelix / iTunes Search API preview URLs. | Alta | Pendiente |
| **TD-04** | **Rendimiento Canvas** | Cuando el grafo supera los 100 nodos simultáneos, ajustar el alfa de desintegración (`alphaDecay`) en `d3-force` para congelar físicas y mantener 60 FPS. | Media | Pendiente |

---

## 💡 Instrucciones para la Inteligencia Artificial (AI Context)
Cuando retomes la conversación en un nuevo chat:
1. Revisa `README.md` y `PDR_musicmap` para entender el punto exacto de avance.
2. Ejecuta `git status` para comprobar si hay cambios pendientes antes de proponer código.
3. Asegúrate de probar builds locales (`npx vite build`) antes de dar por completada una tarea.
