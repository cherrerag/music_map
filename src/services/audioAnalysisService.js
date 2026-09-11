const FFT_SIZE = 128;
const NUM_BANDS = 16;
const SMOOTH_ATTACK = 0.6;
const SMOOTH_RELEASE = 0.4;

class AudioAnalysisService {
  constructor() {
    this._ctx = null;
    this._analyser = null;
    this._rawBuf = null;
    this._smoothBands = new Float32Array(NUM_BANDS);
    this._testOscillator = null;
    this._testGain = null;
    this._connected = false;
  }

  connect(audioElement) {
    if (this._connected) return;
    try {
      if (!this._ctx) {
        this._ctx = new (window.AudioContext || window.webkitAudioContext)();
        this._analyser = this._ctx.createAnalyser();
        this._analyser.fftSize = FFT_SIZE;
        this._rawBuf = new Uint8Array(this._analyser.frequencyBinCount);
        this._analyser.connect(this._ctx.destination);
      }
      if (audioElement) {
        const src = this._ctx.createMediaElementSource(audioElement);
        src.connect(this._analyser);
      }
      this._connected = true;
      if (this._ctx.state === 'suspended') this._ctx.resume();
    } catch (e) {
      console.warn('AudioAnalysisService.connect error:', e);
    }
  }

  tick() {
    if (!this._analyser) return;
    this._analyser.getByteFrequencyData(this._rawBuf);
    const binCount = this._rawBuf.length;
    const binsPerBand = Math.floor(binCount / NUM_BANDS);
    for (let b = 0; b < NUM_BANDS; b++) {
      let sum = 0;
      for (let k = 0; k < binsPerBand; k++) {
        sum += this._rawBuf[b * binsPerBand + k];
      }
      const raw = (sum / binsPerBand) / 255;
      const shaped = Math.min(1.0, 2.0 * Math.pow(raw, 0.85));
      const alpha = shaped > this._smoothBands[b] ? SMOOTH_ATTACK : SMOOTH_RELEASE;
      this._smoothBands[b] = alpha * shaped + (1 - alpha) * this._smoothBands[b];
    }
  }

  getBands() {
    return this._smoothBands;
  }

  getVolume() {
    let sum = 0;
    for (let i = 0; i < NUM_BANDS; i++) sum += this._smoothBands[i];
    return sum / NUM_BANDS;
  }

  getMetrics() {
    const bands = this._smoothBands;
    const volume = this.getVolume();
    const bass = (bands[0] + bands[1]) / 2;
    const snare = (bands[5] + bands[6] + bands[7]) / 3;
    const high = (bands[12] + bands[13] + bands[14]) / 3;
    return { volume, bass, snare, high, bands };
  }

  startTestSignal() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._analyser = this._ctx.createAnalyser();
      this._analyser.fftSize = FFT_SIZE;
      this._rawBuf = new Uint8Array(this._analyser.frequencyBinCount);
      this._analyser.connect(this._ctx.destination);
      this._connected = true;
    }
    if (this._ctx.state === 'suspended') this._ctx.resume();
    this._testOscillator = this._ctx.createOscillator();
    this._testGain = this._ctx.createGain();
    this._testOscillator.type = 'sawtooth';
    this._testOscillator.frequency.setValueAtTime(80, this._ctx.currentTime);
    this._testGain.gain.setValueAtTime(0.3, this._ctx.currentTime);
    this._testOscillator.connect(this._testGain);
    this._testGain.connect(this._analyser);
    this._testOscillator.start();
  }

  stopTestSignal() {
    if (this._testOscillator) {
      try { this._testOscillator.stop(); } catch (e) {}
      this._testOscillator.disconnect();
      this._testOscillator = null;
    }
    if (this._testGain) {
      this._testGain.disconnect();
      this._testGain = null;
    }
  }
}

export const audioAnalysisService = new AudioAnalysisService();
