import { renderMode, MODE_IDS } from './ledModes/index.js';

export const PALETTES = {
  amber:     [[255,90,0],[200,90,20],[255,190,0],[120,50,10]],
  cyberpunk: [[0,200,255],[180,0,255],[0,255,180],[60,0,200]],
  lava:      [[140,0,0],[255,140,0],[255,0,0],[80,0,0]],
  jazz:      [[0,120,255],[255,150,0],[200,60,255],[255,255,200]],
};

const NUM_LEDS = 480;
const MID = 240;

export function createLedStrip() {
  const buffer = new Array(NUM_LEDS).fill(null).map(() => ({ r: 0, g: 0, b: 0 }));
  let brightness = 80;
  let palette = PALETTES.amber;

  function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }

  function clear() {
    for (let i = 0; i < NUM_LEDS; i++) buffer[i] = { r: 0, g: 0, b: 0 };
  }

  function setPixel(i, color) {
    if (i < 0 || i >= NUM_LEDS) return;
    buffer[i] = { r: clamp(color.r), g: clamp(color.g), b: clamp(color.b) };
  }

  function getPixel(i) {
    if (i < 0 || i >= NUM_LEDS) return { r: 0, g: 0, b: 0 };
    return { ...buffer[i] };
  }

  function blend(c1, c2, t) {
    return {
      r: clamp(c1[0] + (c2[0] - c1[0]) * t),
      g: clamp(c1[1] + (c2[1] - c1[1]) * t),
      b: clamp(c1[2] + (c2[2] - c1[2]) * t)
    };
  }

  function applyBrightness() {
    const scale = brightness / 255;
    for (let i = 0; i < NUM_LEDS; i++) {
      buffer[i].r = clamp(buffer[i].r * scale);
      buffer[i].g = clamp(buffer[i].g * scale);
      buffer[i].b = clamp(buffer[i].b * scale);
    }
  }

  function getBuffer() {
    return buffer;
  }

  function setBrightness(v) { brightness = Math.max(12, Math.min(255, v)); }
  function getBrightness() { return brightness; }

  function setPalette(name) {
    if (PALETTES[name]) palette = PALETTES[name];
  }

  const helpers = { clear, setPixel, getPixel, blend, applyBrightness, NUM_LEDS, MID };

  function render(modeId, metrics) {
    renderMode(modeId, helpers, metrics, palette);
    applyBrightness();
  }

  // Legacy convenience methods used by FEAT-02 component (kept for compatibility)
  function renderGravity(volume) {
    render('gravity', { volume, bass: volume, snare: 0, high: 0, bands: new Float32Array(16) });
  }

  function renderPlasma(energy) {
    render('plasma', { volume: energy, bass: energy, snare: 0, high: 0, bands: new Float32Array(16) });
  }

  function renderJazz(bands) {
    const b16 = new Float32Array(16);
    if (bands) for (let i = 0; i < Math.min(bands.length, 16); i++) b16[i] = bands[i];
    const volume = b16.reduce((a, v) => a + v, 0) / 16;
    render('jazz', { volume, bass: (b16[0] + b16[1]) / 2, snare: (b16[5] + b16[6] + b16[7]) / 3, high: (b16[12] + b16[13] + b16[14]) / 3, bands: b16 });
  }

  return {
    clear, setPixel, getPixel, blend, applyBrightness,
    setBrightness, getBrightness, setPalette,
    getBuffer, render,
    renderGravity, renderPlasma, renderJazz,
    NUM_LEDS, MID
  };
}

export { MODE_IDS };
