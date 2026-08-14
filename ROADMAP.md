# ROADMAP: MusicMap 🌊 — Plan de Desarrollo y Hitos

## 🟢 Hitos Desplegados y Completados (v1.0 - v1.5)

### v1.0 — Prototipo Base de Grafo de Afinidad
- [x] Implementación de canvas D3 Force en React (`NetworkGraph.jsx`).
- [x] Nodos semilla e interacción de zoom/arrastre.

### v1.1 — Motor Geocultural & Afinidad Multidimensional
- [x] Algoritmo de 3 órbitas (Local, Sonora y Global).
- [x] Enlaces multicromáticos (🟢 Verde, 🟣 Violeta, 🔵 Cian).
- [x] Tarjeta de Radar de Afinidad en `ArtistSidebar.jsx`.
- [x] Detección de país del usuario por zona horaria.

### v1.2 — Integración de Previews de Audio Reales
- [x] Sustitución de audio MIDI por iTunes API CDN.
- [x] Búsqueda global en tiempo real en la barra superior.

### v1.3 — Catálogo Expandido y Creador de Playlists
- [x] Carga de hasta 20 canciones reales por artista.
- [x] Botón `+ Playlist` por canción con validación inmediata.
- [x] Consola gestora `PlaylistCartModal` (Reordenamiento, previews, eliminación).

### v1.4 — Integración Avanzada con TIDAL 🌊
- [x] Generador y descargador de archivos `.csv` estructurados para TIDAL.
- [x] Generador de archivos `.m3u` e integración con TuneMyMusic / Soundiiz.

### v1.5 — Control de Densidad de Constelación
- [x] Selector dinámico de afines (6 / 10 / 15).
- [x] Incremento del catálogo predeterminado a 10 afines (200 canciones afines por búsqueda).

---

## 🟡 Próximos Hitos (v2.0+)

### v2.0 — Autenticación Directa con TIDAL API & Spotify Web API
- [ ] OAuth 2.0 Login con cuenta de TIDAL para guardar playlists directamente sin pasos intermedios.
- [ ] Reproducción continua sin límite de 30 segundos para usuarios con suscripción Premium en TIDAL.

### v2.1 — Modo Comparativo "Radio / Mezcla entre 2 Artistas"
- [ ] Seleccionar 2 artistas semilla (ej: *Sade* + *Gustavo Cerati*) y generar el camino de afinidad más corto (*Shortest Path Algorithm*) entre ambos.

### v2.2 — Visualizador 3D (Three.js / WebGL)
- [ ] Modo alternativo de constelación tridimensional espacial.
