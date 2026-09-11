const gravityState = { peaks: [0, 0], vels: [0, 0] };
const rainbowState = { hueShift: 0 };
const strobeState = { flash: 0 };

function hsvToRgb(h, s, v) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r, g, b;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    default: r = v; g = p; b = q; break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function lerp(c1, c2, t) {
  return {
    r: Math.round(c1[0] + (c2[0] - c1[0]) * t),
    g: Math.round(c1[1] + (c2[1] - c1[1]) * t),
    b: Math.round(c1[2] + (c2[2] - c1[2]) * t)
  };
}

export function renderJazz(h, metrics, palette) {
  const { clear, setPixel, NUM_LEDS } = h;
  const { bands } = metrics;
  const channels = [
    (bands[0] + bands[1]) / 2,
    (bands[2] + bands[3]) / 2,
    (bands[5] + bands[6]) / 2,
    (bands[8] + bands[9]) / 2,
    (bands[12] + bands[13]) / 2
  ];
  const mid = Math.floor(NUM_LEDS / 2);
  const seg = Math.floor(NUM_LEDS / 10);
  clear();
  for (let ch = 0; ch < 5; ch++) {
    const lit = Math.min(seg, Math.floor(channels[ch] * seg));
    const col = palette[ch % palette.length];
    for (let i = 0; i < lit; i++) {
      const px = { r: col[0], g: col[1], b: col[2] };
      setPixel(mid + ch * seg + i, px);
      setPixel(mid - 1 - ch * seg - i, px);
    }
  }
}

export function renderGravity(h, metrics, palette) {
  const { clear, setPixel, NUM_LEDS } = h;
  const { volume } = metrics;
  const G = 0.5;
  const mid = Math.floor(NUM_LEDS / 2);
  const level = Math.floor(volume * mid);
  clear();
  for (let i = 0; i < level; i++) {
    const ratio = i / mid;
    const c = lerp(palette[2 % palette.length], palette[0], ratio);
    setPixel(mid + i, c);
    setPixel(mid - 1 - i, c);
  }
  for (let side = 0; side < 2; side++) {
    if (level > gravityState.peaks[side]) {
      gravityState.peaks[side] = level;
      gravityState.vels[side] = volume * 2;
    } else {
      gravityState.vels[side] -= G;
      gravityState.peaks[side] += gravityState.vels[side];
      if (gravityState.peaks[side] < 0) { gravityState.peaks[side] = 0; gravityState.vels[side] = 0; }
    }
    const pos = Math.floor(gravityState.peaks[side]);
    if (pos > 0 && pos < mid) {
      setPixel(side === 0 ? mid + pos : mid - 1 - pos, { r: 255, g: 255, b: 255 });
    }
  }
}

export function renderFireflies(h, metrics, palette) {
  const { setPixel, getPixel, NUM_LEDS } = h;
  const { high } = metrics;
  for (let i = 0; i < NUM_LEDS; i++) {
    const cur = getPixel(i);
    setPixel(i, { r: Math.round(cur.r * 0.9), g: Math.round(cur.g * 0.9), b: Math.round(cur.b * 0.9) });
  }
  const sparks = Math.floor(high * 10);
  for (let s = 0; s < sparks; s++) {
    const pos = Math.floor(Math.random() * NUM_LEDS);
    const c = palette[Math.floor(Math.random() * palette.length)];
    setPixel(pos, { r: c[0], g: c[1], b: c[2] });
  }
}

export function renderTwinkle(h, metrics) {
  const { setPixel, getPixel, NUM_LEDS } = h;
  const { high } = metrics;
  for (let i = 0; i < NUM_LEDS; i++) {
    const cur = getPixel(i);
    setPixel(i, { r: Math.round(cur.r * 0.95), g: Math.round(cur.g * 0.95), b: Math.round(cur.b * 0.95) });
  }
  if (high > 0.3) {
    const count = Math.floor(high * 6);
    for (let k = 0; k < count; k++) {
      const pos = Math.floor(Math.random() * NUM_LEDS);
      setPixel(pos, { r: 255, g: 255, b: 255 });
    }
  }
}

export function renderStrobe(h, metrics) {
  const { setPixel, NUM_LEDS } = h;
  const { bass } = metrics;
  if (bass > 0.85) strobeState.flash = 1.0;
  const f = strobeState.flash;
  const v = Math.round(255 * f);
  const px = { r: v, g: v, b: v };
  for (let i = 0; i < NUM_LEDS; i++) setPixel(i, px);
  strobeState.flash *= 0.80;
  if (strobeState.flash < 0.05) strobeState.flash = 0;
}

export function renderRainbow(h, metrics) {
  const { setPixel, NUM_LEDS } = h;
  const { volume } = metrics;
  rainbowState.hueShift += 10 / 500 + volume * 0.05;
  if (rainbowState.hueShift >= 1) rainbowState.hueShift -= 1;
  for (let i = 0; i < NUM_LEDS; i++) {
    let hue = rainbowState.hueShift + i / NUM_LEDS;
    if (hue > 1) hue -= 1;
    setPixel(i, hsvToRgb(hue, 1, 1));
  }
}
