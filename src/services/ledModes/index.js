import { renderNebula, renderMatrix, renderMeteor, renderBreathe } from './ambientModes.js';
import { renderJazz, renderGravity, renderFireflies, renderTwinkle, renderStrobe, renderRainbow } from './frequencyModes.js';
import { renderQuantum, renderCollider, renderPlasma, renderFountain, renderHeartbeat, renderScanner, renderDNA } from './physicsModes.js';
import { renderPong, renderBoom, renderRace, renderPacman, renderClash, renderWorm, renderInvaders, renderThunder, renderAnts } from './arcadeModes.js';

export const MODES_REGISTRY = {
  nebula:    { fn: renderNebula,   label: '🌌 Nebulosa Psicodélica',       category: 'ambient' },
  jazz:      { fn: renderJazz,     label: '🎷 Jazz (Espectrómetro)',        category: 'frequency' },
  quantum:   { fn: renderQuantum,  label: '💧 Onda Cuántica',               category: 'bass' },
  collider:  { fn: renderCollider, label: '☄️ Colisionador Cyberpunk',      category: 'snare' },
  plasma:    { fn: renderPlasma,   label: '🌋 Plasma Cinético',             category: 'fluid' },
  gravity:   { fn: renderGravity,  label: '🎇 Gravedad VU',                 category: 'frequency' },
  matrix:    { fn: renderMatrix,   label: '💻 Matrix Rain',                 category: 'ambient' },
  fireflies: { fn: renderFireflies,label: '✨ Luciérnagas',                 category: 'high' },
  strobe:    { fn: renderStrobe,   label: '⚡ Estrobo EDM',                 category: 'bass' },
  scanner:   { fn: renderScanner,  label: '👁️ Escáner Cylon',              category: 'fluid' },
  heartbeat: { fn: renderHeartbeat,label: '❤️ Latido',                      category: 'bass' },
  rainbow:   { fn: renderRainbow,  label: '🌈 Arcoíris BPM',               category: 'frequency' },
  breathe:   { fn: renderBreathe,  label: '😮‍💨 Respiración',             category: 'ambient' },
  fountain:  { fn: renderFountain, label: '⛲ Fuente',                      category: 'fluid' },
  meteor:    { fn: renderMeteor,   label: '🌠 Meteoro',                     category: 'ambient' },
  twinkle:   { fn: renderTwinkle,  label: '🌟 Destellos',                  category: 'high' },
  ants:      { fn: renderAnts,     label: '🐜 Hormigas',                    category: 'arcade' },
  dna:       { fn: renderDNA,      label: '🧬 ADN Giratorio',              category: 'fluid' },
  pong:      { fn: renderPong,     label: '🏓 Acoustic Pong',              category: 'arcade' },
  boom:      { fn: renderBoom,     label: '🎆 Bomba de Tiempo',            category: 'arcade' },
  race:      { fn: renderRace,     label: '🏍️ Carrera Neón',             category: 'arcade' },
  pacman:    { fn: renderPacman,   label: '👻 Pac-Man Arcade',             category: 'arcade' },
  clash:     { fn: renderClash,    label: '⚔️ Sables Láser',              category: 'snare' },
  worm:      { fn: renderWorm,     label: '🐛 Gusano Glotón',             category: 'arcade' },
  invaders:  { fn: renderInvaders, label: '🔫 Fuego Cruzado',             category: 'high' },
  thunder:   { fn: renderThunder,  label: '⛈️ Tormenta Reactiva',        category: 'bass' },
};

export const MODE_IDS = Object.keys(MODES_REGISTRY);

export function renderMode(modeId, helpers, metrics, palette) {
  const entry = MODES_REGISTRY[modeId];
  if (!entry) return;
  entry.fn(helpers, metrics, palette);
}
