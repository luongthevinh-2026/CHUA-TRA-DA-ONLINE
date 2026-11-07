/**
 * Zero-Asset Web Audio API Synthesizer for Buddhist Temple Sounds
 * Generates temple bell (chuông đại hồng chung), wooden fish (mõ), and ambient wind.
 */

class TempleAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : 0.05, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Deep resonant Buddhist Temple Bell (Chuông Đại Hồng Chung)
   * Rich harmonics with slow exponential decay
   */
  public playTempleBell(pitch: number = 216) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const duration = 5.5;

      // Master bell gain
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.45, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      masterGain.connect(this.ctx.destination);

      // Harmonics ratios for bronze singing bell
      const harmonics = [
        { freq: pitch * 0.5, gain: 0.8 }, // Sub-harmonic strike
        { freq: pitch * 1.0, gain: 1.0 }, // Fundamental
        { freq: pitch * 1.51, gain: 0.6 }, // Fifth
        { freq: pitch * 2.02, gain: 0.4 }, // Octave
        { freq: pitch * 2.76, gain: 0.3 }, // Harmonic 3
        { freq: pitch * 3.42, gain: 0.2 }, // Harmonic 4
        { freq: pitch * 4.15, gain: 0.1 }, // Shimmer
      ];

      harmonics.forEach(({ freq, gain }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Subtle strike vibrato
        oscGain.gain.setValueAtTime(gain, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration * (0.6 + Math.random() * 0.4));

        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + duration);
      });
    } catch {
      // AudioContext fallback
    }
  }

  /**
   * Traditional Buddhist Wooden Fish (Tiếng Mõ Tụng Kinh)
   * Warm, hollow resonant wood tap
   */
  public playWoodenFish(pitch: number = 580) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const duration = 0.25;

      // Pitch envelope for wooden tap "pop"
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(pitch, now);
      filter.Q.setValueAtTime(5, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch * 1.4, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.9, now + 0.04);

      oscGain.gain.setValueAtTime(0.8, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // AudioContext fallback
    }
  }

  /**
   * Incense lighting sparkle chime
   */
  public playIncenseChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C E G C arpeggio

      freqs.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + i * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 1.2);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Gentle wind ambiance
   */
  public startAmbientWind() {
    if (this.ambientGain || this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pink/Brown noise
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 1.5;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.035, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      noise.start();
    } catch {
      // AudioContext fallback
    }
  }
}

export const templeAudio = new TempleAudioSynthesizer();
