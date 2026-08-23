/**
 * Web Audio API synthesizer for 8-bit retro sound effects.
 * Requires zero external audio files.
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('tetris_muted') === 'true';
    this.masterGain = null;
    this._unlocked = false;

    const unlockAudio = () => {
      this._unlocked = true;
      this.init();
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
    window.addEventListener('keydown', unlockAudio, { once: true, passive: true });
    window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
  }

  init() {
    if (this.muted) return;
    try {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.25, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);
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
    this.muted = !this.muted;
    localStorage.setItem('tetris_muted', this.muted);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.25, this.ctx.currentTime);
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  playTone(freq, type = 'square', duration = 0.08, startTimeOffset = 0, gainLevel = 1.0) {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTimeOffset);

      gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime + startTimeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTimeOffset + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime + startTimeOffset);
      osc.stop(this.ctx.currentTime + startTimeOffset + duration);
    } catch (e) {
      // Audio context might be restricted before first user interaction
    }
  }

  playMove() {
    this.playTone(320, 'square', 0.04, 0, 0.4);
  }

  playRotate() {
    this.playTone(480, 'sine', 0.06, 0, 0.6);
  }

  playSoftDrop() {
    this.playTone(200, 'triangle', 0.03, 0, 0.3);
  }

  playHardDrop() {
    this.playTone(160, 'sawtooth', 0.12, 0, 0.8);
    this.playTone(80, 'square', 0.14, 0.02, 0.6);
  }

  playHold() {
    this.playTone(350, 'triangle', 0.05, 0, 0.5);
    this.playTone(550, 'triangle', 0.06, 0.04, 0.5);
  }

  playLineClear(lines) {
    if (lines === 1) {
      this.playTone(523.25, 'triangle', 0.1, 0, 0.7); // C5
      this.playTone(659.25, 'triangle', 0.15, 0.08, 0.8); // E5
    } else if (lines === 2) {
      this.playTone(523.25, 'triangle', 0.1, 0, 0.7);
      this.playTone(659.25, 'triangle', 0.1, 0.07, 0.8);
      this.playTone(783.99, 'triangle', 0.2, 0.14, 0.9); // G5
    } else if (lines === 3) {
      this.playTone(440.00, 'square', 0.08, 0, 0.7);
      this.playTone(554.37, 'square', 0.08, 0.07, 0.8);
      this.playTone(659.25, 'square', 0.08, 0.14, 0.8);
      this.playTone(880.00, 'square', 0.22, 0.21, 0.9);
    } else if (lines >= 4) {
      // TETRIS fanfare!
      const notes = [523.25, 659.25, 783.99, 1046.50, 880.00, 1046.50];
      notes.forEach((freq, idx) => {
        this.playTone(freq, 'square', 0.12, idx * 0.07, 0.9);
      });
    }
  }

  playLevelUp() {
    const notes = [440, 554, 659, 880, 1108];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.1, idx * 0.06, 0.8);
    });
  }

  playGameOver() {
    const notes = [440, 415, 392, 370, 349, 311, 220];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'sawtooth', 0.16, idx * 0.1, 0.7);
    });
  }
}

// Global Sound Instance
const sound = new SoundSystem();
