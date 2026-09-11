const pongState = { ballPos: 240, ballDir: 1.5 };
const boomState = { energyAccum: 0, explosion: 0 };
const raceState = { pos: [0, 0, 0], winnerFlash: 0, winnerIdx: 0 };
const pacmanState = { pacPos: 240, ghostPos: [220, 210, 200], dir: 1, powerMode: 0 };
const clashState = { clashPos: 240 };
const wormState = { headPos: 0, orbPos: 120, digestionPos: -1, dir: 1, hasOrb: true };
const invadersState = { aliens: [470, 440, 410, 380, 350], missiles: [0, 0, 0, 0, 0] };
const thunderState = { lightningFlash: 0 };
const antsState = { antPos: [0, 120, 240, 360] };

export function renderPong(h, metrics, palette) {
  const { clear, setPixel, NUM_LEDS } = h;
  const { volume } = metrics;
  const paddleSize = 8;
  pongState.ballPos += pongState.ballDir * (1 + volume * 2);
  if (pongState.ballPos >= NUM_LEDS - 1 - paddleSize) { pongState.ballPos = NUM_LEDS - 1 - paddleSize; pongState.ballDir = -Math.abs(pongState.ballDir); }
  if (pongState.ballPos <= paddleSize) { pongState.ballPos = paddleSize; pongState.ballDir = Math.abs(pongState.ballDir); }
  clear();
  for (let i = 0; i < paddleSize; i++) {
    const c0 = palette[0]; const c1 = palette[1 % palette.length];
    setPixel(i, { r: c0[0], g: c0[1], b: c0[2] });
    setPixel(NUM_LEDS - 1 - i, { r: c1[0], g: c1[1], b: c1[2] });
  }
  setPixel(Math.floor(pongState.ballPos), { r: 255, g: 255, b: 255 });
}

export function renderBoom(h, metrics, palette) {
  const { clear, setPixel, NUM_LEDS } = h;
  const { volume, high, bass } = metrics;
  clear();
  if (boomState.explosion > 0.01) {
    const center = Math.floor(NUM_LEDS / 2);
    const radius = (1 - boomState.explosion) * NUM_LEDS;
    for (let i = 0; i < NUM_LEDS; i++) {
      const dist = Math.abs(i - center);
      if (dist <= radius && dist > radius - 20) {
        const intensity = boomState.explosion * (1 - (radius - dist) / 20);
        const c = palette[Math.floor(Math.random() * palette.length)];
        setPixel(i, { r: Math.round(c[0] * intensity), g: Math.round(c[1] * intensity), b: Math.round(c[2] * intensity) });
      }
    }
    boomState.explosion *= 0.90;
    if (boomState.explosion <= 0.01) { boomState.explosion = 0; boomState.energyAccum = 0; }
  } else {
    boomState.energyAccum += volume * 10 * 0.05;
    const center = Math.floor(NUM_LEDS / 2);
    const fill = Math.floor(boomState.energyAccum);
    if (fill >= center || (boomState.energyAccum > center * 0.5 && bass > 0.95)) {
      boomState.explosion = 1.0;
    } else {
      for (let i = 0; i < fill; i++) {
        setPixel(i, { r: 255, g: 0, b: 0 });
        setPixel(NUM_LEDS - 1 - i, { r: 255, g: 0, b: 0 });
      }
      if (high > 0.5) {
        for (let i = 0; i < Math.floor(high * 5); i++) {
          const pos = Math.floor(Math.random() * Math.max(1, fill));
          setPixel(pos, { r: 255, g: 255, b: 255 });
          setPixel(NUM_LEDS - 1 - pos, { r: 255, g: 255, b: 255 });
        }
      }
    }
  }
}

export function renderRace(h, metrics, palette) {
  const { clear, setPixel, NUM_LEDS } = h;
  const { bass, snare, high } = metrics;
  clear();
  if (raceState.winnerFlash > 0) {
    const c = palette[raceState.winnerIdx % palette.length];
    const intensity = raceState.winnerFlash / 20;
    const px = { r: Math.round(c[0] * intensity), g: Math.round(c[1] * intensity), b: Math.round(c[2] * intensity) };
    for (let i = 0; i < NUM_LEDS; i++) setPixel(i, px);
    raceState.winnerFlash--;
    if (raceState.winnerFlash === 0) { raceState.pos[0] = 0; raceState.pos[1] = 0; raceState.pos[2] = 0; }
    return;
  }
  const speeds = [bass, snare, high];
  for (let i = 0; i < 3; i++) {
    raceState.pos[i] += speeds[i] * (10 / 4);
    if (raceState.pos[i] >= NUM_LEDS) { raceState.winnerFlash = 20; raceState.winnerIdx = i; return; }
    const col = palette[i % palette.length];
    const p = Math.floor(raceState.pos[i]);
    if (p < NUM_LEDS) setPixel(p, { r: col[0], g: col[1], b: col[2] });
    if (p - 1 >= 0) setPixel(p - 1, { r: Math.round(col[0] * 0.5), g: Math.round(col[1] * 0.5), b: Math.round(col[2] * 0.5) });
  }
}

export function renderPacman(h, metrics, palette) {
  const { clear, setPixel, NUM_LEDS } = h;
  const { bass } = metrics;
  clear();
  if (bass > 0.9 && pacmanState.powerMode === 0) pacmanState.powerMode = 100;
  if (pacmanState.powerMode > 0) pacmanState.powerMode--;
  pacmanState.pacPos += (10 / 10) * pacmanState.dir;
  if (pacmanState.pacPos >= NUM_LEDS - 1) pacmanState.dir = -1;
  if (pacmanState.pacPos <= 0) pacmanState.dir = 1;
  setPixel(Math.floor(pacmanState.pacPos), { r: 255, g: 255, b: 0 });
  for (let i = 0; i < 3; i++) {
    const gSpeed = pacmanState.powerMode > 0 ? 10 / 20 : (10 / 15 + bass * 2);
    const gDir = (pacmanState.pacPos > pacmanState.ghostPos[i])
      ? (pacmanState.powerMode > 0 ? -1 : 1)
      : (pacmanState.powerMode > 0 ? 1 : -1);
    pacmanState.ghostPos[i] += gSpeed * gDir;
    pacmanState.ghostPos[i] = Math.max(0, Math.min(NUM_LEDS - 1, pacmanState.ghostPos[i]));
    const gCol = pacmanState.powerMode > 0 ? { r: 0, g: 0, b: 255 } : { r: palette[(i + 1) % palette.length][0], g: palette[(i + 1) % palette.length][1], b: palette[(i + 1) % palette.length][2] };
    setPixel(Math.floor(pacmanState.ghostPos[i]), gCol);
  }
}

export function renderClash(h, metrics, palette) {
  const { clear, setPixel, NUM_LEDS } = h;
  const { bass, snare, high } = metrics;
  clear();
  const push = (bass - high) * (10 / 2);
  clashState.clashPos = Math.max(20, Math.min(NUM_LEDS - 20,
    clashState.clashPos + push + (NUM_LEDS / 2 - clashState.clashPos) * 0.05
  ));
  const cPos = Math.floor(clashState.clashPos);
  const c0 = palette[0]; const c1 = palette[1 % palette.length];
  for (let i = 0; i < cPos; i++) setPixel(i, { r: c0[0], g: c0[1], b: c0[2] });
  for (let i = cPos; i < NUM_LEDS; i++) setPixel(i, { r: c1[0], g: c1[1], b: c1[2] });
  setPixel(cPos, { r: 255, g: 255, b: 255 });
}

export function renderWorm(h, metrics, palette) {
  const { clear, setPixel, NUM_LEDS } = h;
  const { bass } = metrics;
  const wormLen = 15;
  clear();
  wormState.headPos += (10 / 10) * wormState.dir;
  if (wormState.headPos >= NUM_LEDS - 1) { wormState.headPos = NUM_LEDS - 1; wormState.dir = -1; }
  if (wormState.headPos <= 0) { wormState.headPos = 0; wormState.dir = 1; }
  if (wormState.hasOrb) setPixel(Math.floor(wormState.orbPos), { r: 255, g: 255, b: 255 });
  if (wormState.hasOrb && bass > 0.8 && Math.abs(wormState.headPos - wormState.orbPos) < wormLen) {
    wormState.hasOrb = false;
    wormState.digestionPos = 0;
    wormState.orbPos = Math.floor(Math.random() * NUM_LEDS);
  }
  if (!wormState.hasOrb && wormState.digestionPos < 0) {
    wormState.hasOrb = true;
  }
  if (wormState.digestionPos >= 0) {
    wormState.digestionPos += 10 / 5;
    if (wormState.digestionPos > wormLen) wormState.digestionPos = -1;
  }
  const wc = palette[0];
  for (let i = 0; i < wormLen; i++) {
    const pos = Math.floor(wormState.headPos - wormState.dir * i);
    if (pos >= 0 && pos < NUM_LEDS) {
      const intensity = 1 - i / wormLen;
      const isDigesting = wormState.digestionPos >= 0 && Math.abs(i - wormState.digestionPos) < 2;
      const c = isDigesting ? [255, 255, 255] : wc;
      setPixel(pos, { r: Math.round(c[0] * intensity), g: Math.round(c[1] * intensity), b: Math.round(c[2] * intensity) });
    }
  }
}

export function renderInvaders(h, metrics, palette) {
  const { clear, setPixel, NUM_LEDS } = h;
  const { high } = metrics;
  clear();
  for (let i = 0; i < 5; i++) {
    const c = palette[0];
    setPixel(i, { r: c[0], g: c[1], b: c[2] });
  }
  if (high > 0.7) {
    for (let i = 0; i < 5; i++) {
      if (invadersState.missiles[i] === 0) { invadersState.missiles[i] = 5; break; }
    }
  }
  for (let i = 0; i < 5; i++) {
    if (invadersState.missiles[i] > 0) {
      invadersState.missiles[i] += 10 / 2;
      if (invadersState.missiles[i] >= NUM_LEDS) invadersState.missiles[i] = 0;
      else setPixel(Math.floor(invadersState.missiles[i]), { r: 0, g: 255, b: 0 });
    }
    invadersState.aliens[i] -= 10 / 20;
    if (invadersState.aliens[i] <= 5) invadersState.aliens[i] = NUM_LEDS - 10;
    setPixel(Math.floor(invadersState.aliens[i]), { r: 255, g: 0, b: 0 });
  }
}

export function renderThunder(h, metrics) {
  const { setPixel, getPixel, NUM_LEDS } = h;
  const { bass } = metrics;
  for (let i = 0; i < NUM_LEDS; i++) {
    const cur = getPixel(i);
    setPixel(i, {
      r: Math.round(cur.r * 0.95),
      g: Math.round(cur.g * 0.95),
      b: Math.max(10, Math.round(cur.b * 0.95))
    });
  }
  if (Math.random() * 100 < 10) setPixel(Math.floor(Math.random() * NUM_LEDS), { r: 0, g: 200, b: 255 });
  if (bass > 0.9 && thunderState.lightningFlash < 0.1) thunderState.lightningFlash = 1.0;
  if (thunderState.lightningFlash > 0.01) {
    const v = Math.round(255 * thunderState.lightningFlash);
    for (let i = 0; i < NUM_LEDS; i++) setPixel(i, { r: v, g: v, b: v });
    thunderState.lightningFlash = Math.random() * 10 > 2
      ? thunderState.lightningFlash * 0.8
      : Math.min(1.0, thunderState.lightningFlash * 1.2);
    if (thunderState.lightningFlash < 0.1) thunderState.lightningFlash = 0;
  }
}

export function renderAnts(h, metrics, palette) {
  const { clear, setPixel, NUM_LEDS } = h;
  const { bass } = metrics;
  clear();
  for (let a = 0; a < 4; a++) {
    antsState.antPos[a] += 10 / 10;
    if (antsState.antPos[a] >= NUM_LEDS) antsState.antPos[a] = 0;
    const head = Math.floor(antsState.antPos[a]);
    const ac = bass > 0.8 ? [255, 255, 255] : palette[a % palette.length];
    for (let s = 0; s < 5; s++) {
      const p = head - s;
      if (p >= 0 && p < NUM_LEDS) {
        const f = 1 - s / 5;
        setPixel(p, { r: Math.round(ac[0] * f), g: Math.round(ac[1] * f), b: Math.round(ac[2] * f) });
      }
    }
  }
}
