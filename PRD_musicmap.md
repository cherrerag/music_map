# PRD: MusicMap 🌊 — Constelación de Descubrimiento Musical

## 1. Visión del Producto
**MusicMap** es una plataforma web interactiva de descubrimiento musical que visualiza conexiones geoculturales, estilísticas y de audiencia entre artistas de todo el mundo mediante constelaciones dinámicas en 2D impulsadas por físicas D3.js. Permite a los amantes de la música explorar relaciones entre sus artistas favoritos, escuchar clips reales de 30 segundos y curar playlists secuenciales exportables directamente a **TIDAL**, Spotify y formatos universales como M3U y CSV.

---

## 2. Arquitectura de Funcionalidades Principales

### 2.1. Grafo Concéntrico & Motor de Físicas (D3 Canvas Engine)
- **Visualización 2D:** Renderizado en Canvas a 60 FPS con estéticas Cyberpunk y Glassmorphism en modo oscuro.
- **Órbitas Geoculturales Concéntricas:**
  - *Órbita Cercana (~110px):* Artistas de la escena local (mismo país/región).
  - *Órbita Distante (~190px):* Artistas de la escena global con alta coincidencia sonora.
- **Enlaces Multicromáticos:**
  - 🟢 **Verde (`#10b981`):** Conexión Geocultural.
  - 🟣 **Violeta (`#8b5cf6`):** Afinidad Sonora & Estilo.
  - 🔵 **Cian (`#00d2ff`):** Coincidencia de Audiencia Global.

### 2.2. Filtros y Control de Constelación
- **Selector de Densidad de Afines:** Permite conmutar la cantidad de artistas afines conectados por nodo entre `6 Afines (Enfoque)`, `10 Afines (Estándar - Predeterminado)` y `15 Afines (Galaxia)`.
- **Min Similitud (Slider):** Filtra conexiones desde 50% hasta 95% de afinidad.
- **Filtro de Escena:** Alterna entre *"Escena Global"* y *"Solo Escena Local"*.
- **Detección Automática de Ubicación:** Asigna el país del usuario mediante la zona horaria del navegador (`Intl.DateTimeFormat().resolvedOptions().timeZone`).

### 2.3. Panel Lateral del Artista & Reproductor CDN (iTunes API)
- **Top 20 Canciones:** Consulta dinámica a la API de iTunes para cargar las 20 mejores canciones reales del artista con títulos exactos de álbumes y clips de audio AAC de 30 segundos.
- **Radar de Afinidad Multidimensional:** Tarjeta visual con porcentajes desglosados de coincidencia sonora, coincidencia de audiencia y flag geocultural.
- **Añadir a Playlist (`+`):** Botón por canción para agregar secuencialmente el tema al carrito musical.

### 2.4. Carrito / Creador de Playlist & Exportación a TIDAL 🌊
- **Modal Gestor (`PlaylistCartModal`):**
  - Título editable de la playlist.
  - Reproductor de previews en vivo.
  - Reordenamiento ascendente/descendente (`⬆`/`⬇`) y eliminación de canciones.
- **Opciones de Exportación:**
  - **Exportación Masiva a TIDAL:** Genera un archivo `.csv` estructurado (`Track Name, Artist Name, Album Name`) compatible con TIDAL, TuneMyMusic y Soundiiz.
  - **Descarga M3U:** Archivo estándar `.m3u` para reproductores multimedia.
  - **Copia al Portapapeles:** Lista formateada en texto plano.
  - **Flujo Guiado:** Integración en 1 clic con **TuneMyMusic** (`https://www.tunemymusic.com/es/transfer`) y **Soundiiz** (`https://soundiiz.com/webapp`).

---

## 3. Requisitos No Funcionales
- **Rendimiento:** Carga inicial < 1.2s en Vercel CDN.
- **Compatibilidad:** Responsive y adaptado para navegadores Chrome, Safari, Firefox y Edge en macOS, Windows y dispositivos móviles.
- **Resiliencia:** Fallback automático del cliente a la API pública de Last.fm si el servidor backend FastAPI se encuentra inaccesible.
