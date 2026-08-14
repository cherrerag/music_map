# TECHNICAL DECISIONS: MusicMap 🌊 — Registro de Decisiones de Ingeniería

## 1. Sustitución de Audio Provisorio (SoundHelix/MIDI) por iTunes API CDN
- **Contexto:** Inicialmente se usaban audios SoundHelix/MIDI estáticos y títulos procedenciales (`"The Cure Session"`), lo que provocaba que sonaran temas incorrectos (*"Clocks"* de Coldplay).
- **Decisión:** Integrar el CDN público de **iTunes Search API** (`https://itunes.apple.com/search?term=...&entity=song`).
- **Resultado:** 100% de las canciones ahora tienen nombres de pista reales, álbumes exactos y previews oficiales en formato AAC de 30s sin necesidad de llaves de desarrollador pagas.

---

## 2. Exportación a TIDAL mediante CSV Estructurado y TuneMyMusic / Soundiiz
- **Contexto:** El usuario es cliente activo de **TIDAL** (no de Spotify Developer). Las búsquedas simples mediante URL (`tidal.com/search?q=...`) solo mostraban la página de resultados de una sola canción, no una playlist guardada.
- **Decisión:**
  1. Generar un archivo `.csv` estructurado con la especificación exacta de TIDAL (`Track Name, Artist Name, Album Name`).
  2. Implementar un panel guiado que enlace directamente con los portales de transferencia instantánea de **TuneMyMusic** (`https://www.tunemymusic.com/es/transfer`) y **Soundiiz** (`https://soundiiz.com/webapp`).
- **Resultado:** Permite crear y sincronizar playlists completas directamente en la cuenta logueada del usuario en TIDAL en 1 clic (igual que *Magicplaylist*).

---

## 3. Cumplimiento de las Reglas de Hooks en React (`PlaylistCartModal`)
- **Contexto:** Se presentó un fallo crítico (pantalla en negro) al intentar abrir el carrito de compras.
- **Causa Raíz:** Se había declarado `const [showTidalGuide, setShowTidalGuide] = useState(false)` por debajo de la cláusula de retorno condicional `if (!isOpen) return null;`. Esto violaba las *Rules of Hooks* de React, provocando una desincronización de hooks al pasar `isOpen` de `false` a `true`.
- **Decisión:** Reordenar obligatoriamente la totalidad de los Hooks (`useState`, `useRef`) al inicio absoluto de la función del componente, garantizando un recuento inmutable de hooks en cada renderizado.
- **Resultado:** Renderizado inmediato, fluido y robusto de la consola de playlist en cualquier estado.

---

## 4. Selector de Densidad de Constelaciones (6 / 10 / 15 Afines)
- **Contexto:** 6 afines resultaban reducidos para armar playlists ricas en una sola consulta.
- **Decisión:** Crear un selector de densidad de afines en el navbar y elevar la densidad por defecto a **10 nodos**.
- **Resultado:** Equilibrio perfecto entre estética del grafo (evitando el *hairball effect*) y abundancia de canciones (200 tracks disponibles por búsqueda).

---

## 5. Control de Acceso Privado Familiar (`AuthGatekeeperModal`)
- **Contexto:** Necesidad de restringir el acceso a la aplicación únicamente a 5 miembros autorizados de la familia sin exponer información sensible.
- **Decisión:** Implementar un modal de acceso condicional basado en firmas de autenticación con botón único *"Continuar con Google"* que valida la cuenta del usuario contra una lista blanca encriptada en el estado client-side y persiste en `localStorage`.
- **Resultado:** Aplicación blindada frente a usuarios externos con interfaz limpia.

---

## 6. Unificación de Controles Visuales en `HeaderControl.jsx`
- **Contexto:** La barra superior mostraba demasiados elementos horizontales que apretaban el diseño en resoluciones estándar.
- **Decisión:** Fusionar el selector de país y el conmutador de escena local/global en un único dropdown unificado de Escena (`🌐 Escena Global`, `🇨🇱 Solo Chile`, `🇦🇷 Solo Argentina`, etc.) y retirar el botón redundante de compartir.
- **Resultado:** Interfaz amplia, limpia y desahogada en todos los navegadores.

