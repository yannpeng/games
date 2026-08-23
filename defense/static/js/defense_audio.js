/**
 * Wildwood Defenders - Web Audio API Procedural Sound Engine
 * Generates custom sound effects for shooting, explosions, lightning, stomps, upgrades and UI.
 */

const DefenseAudio = (function () {
  'use strict';

  let audioCtx = null;
  let isMuted = false;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type, duration, startVol = 0.15, endVol = 0.001) {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(startVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(endVol, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  return {
    toggleMute() {
      isMuted = !isMuted;
      return isMuted;
    },
    isMuted() {
      return isMuted;
    },

    playShoot(type) {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      switch (type) {
        case 'carrot_bullet': // Rapid fire high blip
          playTone(850 + Math.random() * 200, 'square', 0.06, 0.08);
          break;
        case 'peck': // Rooster sharp pop
          playTone(400, 'triangle', 0.08, 0.12);
          break;
        case 'egg_bomb': // Hen heavy thud launch
          playTone(180, 'sine', 0.18, 0.2);
          break;
        case 'sniper_acorn': // Squirrel laser-like sharp crack
          playTone(1200, 'sawtooth', 0.12, 0.15);
          break;
        case 'stomp_wave': // Deer bass boom
          playTone(90, 'triangle', 0.35, 0.25);
          break;
        case 'poison_flask': // Raccoon bubbling splash
          playTone(600, 'sine', 0.15, 0.12);
          break;
        case 'dive_claw': // Eagle screech sweep
          if (ctx) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(900, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.18, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          }
          break;
        case 'chain_lightning': // Owl electric zap
          playTone(1100 + Math.random() * 400, 'sawtooth', 0.1, 0.16);
          break;
        case 'golden_paw': // Golden Shaded Cat shimmering chime
          playTone(880, 'sine', 0.08, 0.2);
          setTimeout(() => playTone(1320, 'sine', 0.12, 0.15), 40);
          break;
        case 'blizzard_storm': // British Longhair Blue Cat icy whistle
          playTone(600, 'triangle', 0.2, 0.2);
          setTimeout(() => playTone(300, 'triangle', 0.25, 0.25), 60);
          break;
        default:
          playTone(500, 'sine', 0.1, 0.1);
      }
    },

    playHit() {
      playTone(280 + Math.random() * 60, 'triangle', 0.06, 0.08);
    },

    playExplode() {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch (e) {}
    },

    playPlace() {
      playTone(520, 'sine', 0.12, 0.15);
      setTimeout(() => playTone(780, 'sine', 0.15, 0.15), 60);
    },

    playUpgrade() {
      playTone(440, 'triangle', 0.1, 0.15);
      setTimeout(() => playTone(660, 'triangle', 0.1, 0.15), 70);
      setTimeout(() => playTone(880, 'triangle', 0.2, 0.18), 140);
    },

    playSell() {
      playTone(400, 'sine', 0.1, 0.15);
      setTimeout(() => playTone(250, 'sine', 0.15, 0.15), 80);
    },

    playWaveStart() {
      playTone(330, 'sawtooth', 0.15, 0.18);
      setTimeout(() => playTone(440, 'sawtooth', 0.15, 0.18), 100);
      setTimeout(() => playTone(550, 'sawtooth', 0.25, 0.22), 200);
    },

    playSkill() {
      playTone(600, 'square', 0.1, 0.2);
      setTimeout(() => playTone(900, 'square', 0.1, 0.2), 90);
      setTimeout(() => playTone(1200, 'square', 0.25, 0.25), 180);
    },

    playVictory() {
      const notes = [440, 554, 659, 880];
      notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 'triangle', 0.3, 0.2), i * 150);
      });
    },

    playDefeat() {
      const notes = [380, 320, 260, 180];
      notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 'sawtooth', 0.35, 0.25), i * 180);
      });
    }
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DefenseAudio;
}
