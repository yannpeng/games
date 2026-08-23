/**
 * Cyberpunk Snake Web Audio API Synthesizer
 * Generates rich 8-bit arcade and cyberpunk sound effects with zero external audio assets.
 */

class SnakeAudioController {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('snake_muted') === 'true';

    const unlockAudio = () => this.init();
    window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
    window.addEventListener('keydown', unlockAudio, { once: true, passive: true });
    window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
  }

  init() {
    if (this.isMuted) return;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // AudioContext policy handled gracefully
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('snake_muted', this.isMuted);
    return this.isMuted;
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio context errors
    }
  }

  playEat() {
    if (this.isMuted || !this.ctx) return;
    this.playTone(587.33, 'triangle', 0.08, 0.2); // D5
    setTimeout(() => this.playTone(880.0, 'sine', 0.1, 0.25), 50); // A5
  }

  playPowerup() {
    if (this.isMuted || !this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'square', 0.1, 0.18), idx * 60);
    });
  }

  playDie() {
    if (this.isMuted || !this.ctx) return;
    const freqs = [350, 260, 180, 90];
    freqs.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.15, 0.25), idx * 80);
    });
  }

  playLevelUp() {
    if (this.isMuted || !this.ctx) return;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.18, 0.25), idx * 75);
    });
  }

  playVictory() {
    if (this.isMuted || !this.ctx) return;
    const fanfare = [
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.12 },
      { f: 783.99, d: 0.12 },
      { f: 1046.5, d: 0.35 }
    ];
    let time = 0;
    fanfare.forEach((n) => {
      setTimeout(() => this.playTone(n.f, 'sine', n.d, 0.3), time);
      time += n.d * 1000 + 40;
    });
  }
}
