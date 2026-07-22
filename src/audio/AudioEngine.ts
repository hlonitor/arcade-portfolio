// ---------------------------------------------------------------------------
// Procedural synthwave + 8-bit SFX engine.
//
// Everything is synthesised at runtime with the WebAudio API, so the site ships
// ZERO audio binaries (great for Performance Efficiency / small bundle). The
// engine is a lazy singleton — the AudioContext is only created after a user
// gesture (browser autoplay policy), which happens on "Press Start".
// ---------------------------------------------------------------------------

type SfxName = 'hover' | 'click' | 'achievement' | 'start';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private step = 0;
  private _musicOn = false;

  private ensure(): AudioContext {
    if (!this.ctx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.0;
      this.musicGain.connect(this.master);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  // --- Sound effects -------------------------------------------------------
  sfx(name: SfxName) {
    if (!this._musicOn && name !== 'start') {
      // SFX still play only when audio is enabled; the UI gates this too.
    }
    const ctx = this.ensure();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.master!);

    switch (name) {
      case 'hover':
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.09);
        break;
      case 'click':
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.13);
        break;
      case 'start':
        this.arp([523, 659, 784, 1047], now, 0.09, 'square', 0.14);
        break;
      case 'achievement':
        this.arp([659, 784, 988, 1319], now, 0.11, 'triangle', 0.16);
        break;
    }
  }

  private arp(
    freqs: number[],
    start: number,
    dt: number,
    type: OscillatorType,
    vol: number,
  ) {
    const ctx = this.ctx!;
    freqs.forEach((f, i) => {
      const t = start + i * dt;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dt * 1.6);
      osc.connect(g);
      g.connect(this.master!);
      osc.start(t);
      osc.stop(t + dt * 1.7);
    });
  }

  // --- Background music: a looping synthwave bass + arp sequence -----------
  startMusic() {
    const ctx = this.ensure();
    if (this._musicOn) return;
    this._musicOn = true;
    this.musicGain!.gain.setTargetAtTime(0.5, ctx.currentTime, 0.5);

    // i–VI–III–VII progression in A minor — the classic synthwave loop.
    const bass = [55, 44, 65.4, 49]; // A1, F1, C2, G1
    const scale = [220, 261.6, 329.6, 392, 440, 523.2];
    const stepMs = 280;

    const tick = () => {
      const now = ctx.currentTime;
      const bar = Math.floor(this.step / 8) % bass.length;

      // Bass pulse on every beat
      this.tone(bass[bar], now, stepMs / 1000, 'sawtooth', 0.22, this.musicGain!);

      // Arp note every step
      const note = scale[(this.step * 2) % scale.length] * (this.step % 4 === 0 ? 1 : 2);
      this.tone(note, now, (stepMs / 1000) * 0.8, 'square', 0.05, this.musicGain!);

      // Soft kick on beats 0 and 4
      if (this.step % 4 === 0) this.noiseKick(now);

      this.step = (this.step + 1) % 64;
    };

    tick();
    this.musicTimer = window.setInterval(tick, stepMs);
  }

  stopMusic() {
    if (!this.ctx) return;
    this._musicOn = false;
    this.musicGain!.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.3);
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private tone(
    freq: number,
    start: number,
    dur: number,
    type: OscillatorType,
    vol: number,
    dest: AudioNode,
  ) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(vol, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(g);
    g.connect(dest);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  private noiseKick(start: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, start);
    osc.frequency.exponentialRampToValueAtTime(45, start + 0.12);
    g.gain.setValueAtTime(0.3, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
    osc.connect(g);
    g.connect(this.musicGain!);
    osc.start(start);
    osc.stop(start + 0.18);
  }

  get musicOn() {
    return this._musicOn;
  }
}

export const audio = new AudioEngine();
