import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createLedStrip, PALETTES, MODE_IDS } from '../services/ledStripEmulator';
import { audioAnalysisService } from '../services/audioAnalysisService';

const NUM_LEDS = 480;
const LED_WIDTH = 3;
const LED_GAP = 0;
const CANVAS_HEIGHT = 52;
const BLOOM_BLUR = 5;

const PALETTE_NAMES = Object.keys(PALETTES);

export default function Ws2812bStripEmulator() {
  const canvasRef = useRef(null);
  const offscreenRef = useRef(null);
  const stripRef = useRef(null);
  const rafRef = useRef(null);
  const testingRef = useRef(false);

  const [mode, setMode] = useState('gravity');
  const [paletteName, setPaletteName] = useState('amber');
  const [brightness, setBrightnessState] = useState(80);
  const [isTesting, setIsTesting] = useState(false);

  // Initialize strip
  useEffect(() => {
    stripRef.current = createLedStrip();
    offscreenRef.current = document.createElement('canvas');
    offscreenRef.current.width = NUM_LEDS * (LED_WIDTH + LED_GAP);
    offscreenRef.current.height = CANVAS_HEIGHT;
  }, []);

  // Sync palette and brightness to strip
  useEffect(() => {
    if (stripRef.current) stripRef.current.setPalette(paletteName);
  }, [paletteName]);

  useEffect(() => {
    if (stripRef.current) stripRef.current.setBrightness(brightness);
  }, [brightness]);

  // Main animation loop
  useEffect(() => {
    let running = true;

    function drawFrame() {
      if (!running || !stripRef.current || !canvasRef.current || !offscreenRef.current) return;

      audioAnalysisService.tick();
      const metrics = audioAnalysisService.getMetrics();
      stripRef.current.render(mode, metrics);

      const buf = stripRef.current.getBuffer();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const oc = offscreenRef.current;
      const octx = oc.getContext('2d');

      octx.clearRect(0, 0, oc.width, oc.height);
      for (let i = 0; i < NUM_LEDS; i++) {
        const { r, g, b } = buf[i];
        if (r === 0 && g === 0 && b === 0) continue;
        octx.fillStyle = `rgb(${r},${g},${b})`;
        octx.fillRect(i * (LED_WIDTH + LED_GAP), 10, LED_WIDTH, CANVAS_HEIGHT - 20);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Chassis gradient background
      const chassis = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      chassis.addColorStop(0, 'rgba(10,12,20,0.95)');
      chassis.addColorStop(1, 'rgba(5,7,14,0.98)');
      ctx.fillStyle = chassis;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bloom pass
      ctx.save();
      ctx.filter = `blur(${BLOOM_BLUR}px)`;
      ctx.globalAlpha = 0.6;
      ctx.drawImage(oc, 0, 0);
      ctx.restore();

      // Sharp pass
      ctx.drawImage(oc, 0, 0);

      // Diffuser overlay
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = 'rgba(255,255,255,1)';
      for (let i = 0; i < NUM_LEDS; i++) {
        ctx.fillRect(i * (LED_WIDTH + LED_GAP), 0, 1, CANVAS_HEIGHT);
      }
      ctx.restore();

      rafRef.current = requestAnimationFrame(drawFrame);
    }

    rafRef.current = requestAnimationFrame(drawFrame);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [mode]);

  const handleToggleTest = useCallback(() => {
    if (!isTesting) {
      audioAnalysisService.startTestSignal();
      setIsTesting(true);
      testingRef.current = true;
    } else {
      audioAnalysisService.stopTestSignal();
      setIsTesting(false);
      testingRef.current = false;
    }
  }, [isTesting]);

  const canvasWidth = NUM_LEDS * (LED_WIDTH + LED_GAP);

  return (
    <div className="ws2812b-dock">
      <div className="ws2812b-chassis">
        <canvas
          ref={canvasRef}
          className="ws2812b-canvas"
          width={canvasWidth}
          height={CANVAS_HEIGHT}
        />
      </div>
      <div className="ws2812b-controls">
        <select
          value={mode}
          onChange={e => setMode(e.target.value)}
          className="ws2812b-mode-select"
        >
          <optgroup label="🎼 Espectro y Analíticos">
            <option value="jazz">🎷 Jazz (Espectrómetro 5 Canales)</option>
            <option value="gravity">🎇 Gravedad VU (Picos Físicos)</option>
            <option value="rainbow">🌈 Arcoíris BPM</option>
          </optgroup>
          <optgroup label="💧 Reactivos a Graves (Kick & Bass)">
            <option value="quantum">💧 Onda Cuántica</option>
            <option value="strobe">⚡ Estrobo EDM</option>
            <option value="heartbeat">❤️ Latido</option>
            <option value="thunder">⛈️ Tormenta Reactiva</option>
          </optgroup>
          <optgroup label="☄️ Reactivos a Medios y Cajas (Snares)">
            <option value="collider">☄️ Colisionador Cyberpunk</option>
            <option value="clash">⚔️ Sables Láser</option>
          </optgroup>
          <optgroup label="✨ Reactivos a Agudos (Hi-Hats & Vocals)">
            <option value="fireflies">✨ Luciérnagas</option>
            <option value="twinkle">🌟 Destellos</option>
            <option value="invaders">🔫 Fuego Cruzado (Invaders)</option>
          </optgroup>
          <optgroup label="🌋 Fluidos y Cinemática">
            <option value="plasma">🌋 Plasma Cinético</option>
            <option value="scanner">👁️ Escáner Cylon</option>
            <option value="breathe">😮‍💨 Respiración</option>
            <option value="fountain">⛲ Fuente</option>
            <option value="dna">🧬 ADN Giratorio</option>
          </optgroup>
          <optgroup label="🏓 Arcade y Juegos">
            <option value="pong">🏓 Acoustic Pong</option>
            <option value="pacman">👻 Pac-Man Arcade</option>
            <option value="worm">🐛 Gusano Glotón</option>
            <option value="boom">🎆 Bomba de Tiempo</option>
            <option value="race">🏍️ Carrera Neón</option>
            <option value="ants">🐜 Hormigas</option>
          </optgroup>
          <optgroup label="🌌 Ambientales (Sin Micrófono)">
            <option value="nebula">🌌 Nebulosa Psicodélica</option>
            <option value="matrix">💻 Matrix Rain</option>
            <option value="meteor">🌠 Meteoro</option>
          </optgroup>
        </select>

        <select
          value={paletteName}
          onChange={e => setPaletteName(e.target.value)}
          className="ws2812b-mode-select"
          style={{ minWidth: '100px' }}
        >
          {PALETTE_NAMES.map(p => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          ☀️
          <input
            type="range"
            min={12}
            max={255}
            value={brightness}
            onChange={e => setBrightnessState(Number(e.target.value))}
            style={{ width: 72, accentColor: '#8b5cf6' }}
          />
        </label>

        <button
          onClick={handleToggleTest}
          className="btn-secondary"
          style={{ fontSize: '0.78rem', padding: '5px 10px' }}
        >
          {isTesting ? '⏹ Stop' : '▶ Simular Audio'}
        </button>
      </div>
    </div>
  );
}
