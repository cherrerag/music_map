// Module-level state (mirrors C++ static locals)
const nebulaState = { time: 0 };
const matrixState = { dropPos: 0 };
const meteorState = { pos: -20 };
const breatheState = { phase: 0 };

export function renderNebula(h, metrics, palette) {
  const { setPixel, NUM_LEDS } = h;
  const speed = 10;
  nebulaState.time += speed / 1000;
  const ps = palette.length;
  for (let i = 0; i < NUM_LEDS; i++) {
    const wave = Math.sin(i * 0.05 + nebulaState.time) * Math.cos(i * 0.02 - nebulaState.time * 0.5);
    const factor = (wave + 1) / 2;
    const idx1 = Math.floor(factor * ps) % ps;
    const idx2 = (idx1 + 1) % ps;
    const bf = (factor * ps) - Math.floor(factor * ps);
    const c1 = palette[idx1], c2 = palette[idx2];
    setPixel(i, {
      r: Math.round(c1[0] + (c2[0] - c1[0]) * bf),
      g: Math.round(c1[1] + (c2[1] - c1[1]) * bf),
      b: Math.round(c1[2] + (c2[2] - c1[2]) * bf)
    });
  }
}

export function renderMatrix(h) {
  const { setPixel, getPixel, NUM_LEDS } = h;
  const speed = 10;
  matrixState.dropPos += speed / 10;
  if (matrixState.dropPos >= NUM_LEDS) matrixState.dropPos = 0;
  for (let i = 0; i < NUM_LEDS; i++) {
    const cur = getPixel(i);
    setPixel(i, {
      r: Math.round(cur.r * 0.9),
      g: Math.round(cur.g * 0.9),
      b: Math.round(cur.b * 0.9)
    });
  }
  setPixel(Math.floor(matrixState.dropPos), { r: 0, g: 255, b: 70 });
}

export function renderMeteor(h, metrics, palette) {
  const { setPixel, getPixel, NUM_LEDS } = h;
  const speed = 10;
  meteorState.pos += speed / 5;
  if (meteorState.pos >= NUM_LEDS + 20) meteorState.pos = -20;
  for (let i = 0; i < NUM_LEDS; i++) {
    const cur = getPixel(i);
    setPixel(i, {
      r: Math.round(cur.r * 0.75),
      g: Math.round(cur.g * 0.75),
      b: Math.round(cur.b * 0.75)
    });
  }
  const mp = Math.floor(meteorState.pos);
  if (mp >= 0 && mp < NUM_LEDS) {
    setPixel(mp, { r: 255, g: 255, b: 255 });
    for (let t = 1; t < 15; t++) {
      const p = mp - t;
      if (p >= 0 && p < NUM_LEDS) {
        const f = 1 - t / 15;
        const c = palette[0];
        setPixel(p, { r: Math.round(c[0] * f), g: Math.round(c[1] * f), b: Math.round(c[2] * f) });
      }
    }
  }
}

export function renderBreathe(h, metrics, palette) {
  const { setPixel, NUM_LEDS } = h;
  const { volume } = metrics;
  breatheState.phase += 0.03;
  const base = (Math.sin(breatheState.phase) + 1) / 2;
  const brightness = base * 0.3 + volume * 0.7;
  const c = palette[0];
  const px = {
    r: Math.round(c[0] * brightness),
    g: Math.round(c[1] * brightness),
    b: Math.round(c[2] * brightness)
  };
  for (let i = 0; i < NUM_LEDS; i++) setPixel(i, px);
}
