const quantumState = { dropPos: 240, rippleRadius: 0, rippleEnergy: 0 };
const colliderState = { pos1: 0, pos2: 479, explosion: 0, traveling: false };
const plasmaState = { time: 0 };
const scannerState = { pos: 0, dir: 1 };
const heartbeatState = { phase: 0 };
const fountainState = {};
const dnaState = { phase: 0 };

function lerp(c1, c2, t) {
  return {
    r: Math.round(c1[0] + (c2[0] - c1[0]) * t),
    g: Math.round(c1[1] + (c2[1] - c1[1]) * t),
    b: Math.round(c1[2] + (c2[2] - c1[2]) * t)
  };
}

export function renderQuantum(h, metrics, palette) {
  const { clear, setPixel, NUM_LEDS } = h;
  const { bass } = metrics;
  if (bass > 0.8 && quantumState.rippleEnergy < 0.2) {
    quantumState.rippleEnergy = 1.0;
    quantumState.rippleRadius = 0;
    quantumState.dropPos = Math.floor(NUM_LEDS / 4 + Math.random() * (NUM_LEDS / 2));
  }
  clear();
  if (quantumState.rippleEnergy > 0.01) {
    quantumState.rippleRadius += 10 * 0.5;
    quantumState.rippleEnergy *= 0.95;
    const c = palette[0];
    for (let i = 0; i < NUM_LEDS; i++) {
      const diff = Math.abs(Math.abs(i - quantumState.dropPos) - quantumState.rippleRadius);
      if (diff < 20) {
        const intensity = (1 - diff / 20) * quantumState.rippleEnergy;
        setPixel(i, {
          r: Math.round(c[0] * intensity),
          g: Math.round(c[1] * intensity),
          b: Math.round(c[2] * intensity)
        });
      }
    }
  }
}

export function renderCollider(h, metrics, palette) {
  const { clear, setPixel, NUM_LEDS } = h;
  const { snare } = metrics;
  clear();
  if (snare > 0.7 && !colliderState.traveling && colliderState.explosion < 0.1) {
    colliderState.traveling = true;
    colliderState.pos1 = 0;
    colliderState.pos2 = NUM_LEDS - 1;
  }
  if (colliderState.traveling) {
    colliderState.pos1 += 10 * 0.8;
    colliderState.pos2 -= 10 * 0.8;
    if (colliderState.pos1 >= colliderState.pos2) {
      colliderState.traveling = false;
      colliderState.explosion = 1.0;
    } else {
      const pc = palette[1 % palette.length];
      for (let i = 0; i < 10; i++) {
        const tail = 1 - i / 10;
        const p1 = Math.floor(colliderState.pos1) - i;
        const p2 = Math.floor(colliderState.pos2) + i;
        if (p1 >= 0) setPixel(p1, { r: Math.round(pc[0] * tail), g: Math.round(pc[1] * tail), b: Math.round(pc[2] * tail) });
        if (p2 < NUM_LEDS) setPixel(p2, { r: Math.round(pc[0] * tail), g: Math.round(pc[1] * tail), b: Math.round(pc[2] * tail) });
      }
    }
  }
  if (colliderState.explosion > 0.01) {
    const center = Math.floor(NUM_LEDS / 2);
    for (let i = center - 40; i <= center + 40; i++) {
      if (i >= 0 && i < NUM_LEDS) {
        const intensity = colliderState.explosion * (1 - Math.abs(i - center) / 40);
        const v = Math.round(255 * intensity);
        setPixel(i, { r: v, g: v, b: v });
      }
    }
    colliderState.explosion *= 0.92;
  }
}

export function renderPlasma(h, metrics, palette) {
  const { setPixel, NUM_LEDS } = h;
  const { volume } = metrics;
  plasmaState.time += 10 / 200 + volume * 0.5;
  const ps = palette.length;
  for (let i = 0; i < NUM_LEDS; i++) {
    const turbulence = volume * 5;
    const wave1 = Math.sin(i * 0.05 + plasmaState.time + turbulence * Math.sin(i * 0.01));
    const wave2 = Math.sin(i * 0.03 - plasmaState.time * 1.2);
    const factor = (wave1 + wave2 + 2) / 4;
    const idx1 = Math.floor(factor * ps) % ps;
    const idx2 = (idx1 + 1) % ps;
    const bf = (factor * ps) - Math.floor(factor * ps);
    setPixel(i, lerp(palette[idx1], palette[idx2], bf));
  }
}

export function renderFountain(h, metrics, palette) {
  const { setPixel, getPixel, NUM_LEDS } = h;
  const { volume } = metrics;
  const mid = Math.floor(NUM_LEDS / 2);
  for (let i = 0; i < NUM_LEDS; i++) {
    const cur = getPixel(i);
    setPixel(i, { r: Math.round(cur.r * 0.85), g: Math.round(cur.g * 0.85), b: Math.round(cur.b * 0.85) });
  }
  if (volume > 0.4) {
    const spread = Math.floor(volume * (mid * 0.8));
    const c = palette[Math.floor(Math.random() * palette.length)];
    const px = { r: c[0], g: c[1], b: c[2] };
    if (mid + spread < NUM_LEDS) setPixel(mid + spread, px);
    if (mid - 1 - spread >= 0) setPixel(mid - 1 - spread, px);
  }
}

export function renderHeartbeat(h, metrics, palette) {
  const { clear, setPixel, NUM_LEDS } = h;
  const { bass } = metrics;
  heartbeatState.phase += 0.05 + bass * 0.15;
  let pulse = Math.sin(heartbeatState.phase);
  if (pulse < 0) pulse = 0;
  const intensity = Math.pow(pulse, 3) * (0.3 + bass * 0.7);
  const mid = Math.floor(NUM_LEDS / 2);
  const radius = Math.floor(intensity * (NUM_LEDS / 4));
  clear();
  const hc = palette[0];
  for (let i = 0; i < radius; i++) {
    const edge = 1 - i / radius;
    const px = { r: Math.round(hc[0] * edge), g: Math.round(hc[1] * edge), b: Math.round(hc[2] * edge) };
    setPixel(mid + i, px);
    setPixel(mid - 1 - i, px);
  }
}

export function renderScanner(h, metrics, palette) {
  const { clear, setPixel, NUM_LEDS } = h;
  const { volume } = metrics;
  scannerState.pos += (10 / 5) * scannerState.dir;
  if (scannerState.pos >= NUM_LEDS - 1) { scannerState.pos = NUM_LEDS - 1; scannerState.dir = -1; }
  if (scannerState.pos <= 0) { scannerState.pos = 0; scannerState.dir = 1; }
  clear();
  const eyeSize = 5 + Math.floor(volume * 25);
  const c = palette[0];
  for (let i = -eyeSize; i <= eyeSize; i++) {
    const idx = Math.floor(scannerState.pos) + i;
    if (idx >= 0 && idx < NUM_LEDS) {
      const intensity = 1 - Math.abs(i) / eyeSize;
      setPixel(idx, { r: Math.round(c[0] * intensity), g: Math.round(c[1] * intensity), b: Math.round(c[2] * intensity) });
    }
  }
}

export function renderDNA(h, metrics, palette) {
  const { clear, setPixel, NUM_LEDS } = h;
  const { volume } = metrics;
  dnaState.phase += 0.04 + volume * 0.1;
  clear();
  const PI = Math.PI;
  for (let i = 0; i < NUM_LEDS; i++) {
    const s1 = Math.sin(i * 0.08 + dnaState.phase);
    const s2 = Math.sin(i * 0.08 + dnaState.phase + PI);
    if (Math.abs(s1) > 0.85) { const c = palette[0]; setPixel(i, { r: c[0], g: c[1], b: c[2] }); }
    if (Math.abs(s2) > 0.85) { const c = palette[1 % palette.length]; setPixel(i, { r: c[0], g: c[1], b: c[2] }); }
    if (Math.abs(s1 - s2) < 0.15) setPixel(i, { r: 255, g: 255, b: 255 });
  }
}
