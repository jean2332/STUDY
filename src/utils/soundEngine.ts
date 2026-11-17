// Audio engine supporting:
// 1) Ambient noise channels ('rain', 'breeze') synthesized via Web Audio API
// 2) Looping background music tracks ('track1' -> /audio/track1.mp3, 'track2' -> /audio/track2.mp3)
//    with automatic procedural Web Audio fallback if the MP3 files are not present in /public/audio.
// 3) Soft completion chime.

export type AmbientChannelId = 'rain' | 'breeze';
export type MusicTrackId = 'track1' | 'track2';

const MUSIC_URLS: Record<MusicTrackId, string> = {
  track1: '/audio/track1.mp3',
  track2: '/audio/track2.mp3',
};

class SoundEngine {
  private ctx: AudioContext | null = null;

  private activeAmbient: Map<
    AmbientChannelId,
    { source: AudioBufferSourceNode; gain: GainNode; filter: BiquadFilterNode }
  > = new Map();

  private activeHtmlAudio: Map<MusicTrackId, HTMLAudioElement> = new Map();
  private activeSynthMusic: Map<
    MusicTrackId,
    { intervalId: number; masterGain: GainNode; nodes: AudioNode[] }
  > = new Map();

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private createNoiseBuffer(ctx: AudioContext, type: AmbientChannelId): AudioBuffer {
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'rain') {
        lastOut = (lastOut + 0.035 * white) / 1.035;
        data[i] = lastOut * 2.4 + white * 0.04;
      } else {
        lastOut = (lastOut + 0.018 * white) / 1.018;
        data[i] = lastOut * 3.1;
      }
    }
    return buffer;
  }

  public setChannel(id: AmbientChannelId, enabled: boolean, volume: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const existing = this.activeAmbient.get(id);

    if (!enabled) {
      if (existing) {
        try {
          existing.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
          window.setTimeout(() => {
            try {
              existing.source.stop();
              existing.source.disconnect();
            } catch {
              // Ignore already stopped source
            }
          }, 180);
        } catch {
          // Ignore teardown errors
        }
        this.activeAmbient.delete(id);
      }
      return;
    }

    const clampedVolume = Math.max(0, Math.min(1, volume)) * (id === 'rain' ? 0.22 : 0.28);

    if (existing) {
      existing.gain.gain.setTargetAtTime(clampedVolume, ctx.currentTime, 0.08);
      return;
    }

    const source = ctx.createBufferSource();
    source.buffer = this.createNoiseBuffer(ctx, id);
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = id === 'rain' ? 'bandpass' : 'lowpass';
    filter.frequency.value = id === 'rain' ? 950 : 380;
    filter.Q.value = id === 'rain' ? 0.65 : 0.7;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.setTargetAtTime(clampedVolume, ctx.currentTime, 0.2);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    this.activeAmbient.set(id, { source, gain, filter });
  }

  public setMusicTrack(id: MusicTrackId, enabled: boolean, volume: number): void {
    const clampedVol = Math.max(0, Math.min(1, volume));

    if (!enabled) {
      this.stopMusicTrack(id);
      return;
    }

    // Update volume if already playing via HTMLAudio
    const htmlAudio = this.activeHtmlAudio.get(id);
    if (htmlAudio) {
      htmlAudio.volume = clampedVol;
      if (htmlAudio.paused) {
        htmlAudio.play().catch(() => {
          this.stopHtmlAudio(id);
          this.startSynthMusic(id, clampedVol);
        });
      }
      return;
    }

    // Update volume if already playing via synth fallback
    const synth = this.activeSynthMusic.get(id);
    if (synth && this.ctx) {
      synth.masterGain.gain.setTargetAtTime(clampedVol * 0.16, this.ctx.currentTime, 0.1);
      return;
    }

    // Attempt HTML5 Audio from /audio/track1.mp3 or /audio/track2.mp3 first
    const audio = new Audio(MUSIC_URLS[id]);
    audio.loop = true;
    audio.volume = clampedVol;

    let fellBack = false;
    const triggerFallback = () => {
      if (fellBack) return;
      fellBack = true;
      this.stopHtmlAudio(id);
      this.startSynthMusic(id, clampedVol);
    };

    audio.addEventListener('error', triggerFallback, { once: true });
    this.activeHtmlAudio.set(id, audio);

    audio.play().catch(() => {
      triggerFallback();
    });
  }

  private stopHtmlAudio(id: MusicTrackId): void {
    const audio = this.activeHtmlAudio.get(id);
    if (audio) {
      try {
        audio.pause();
        audio.src = '';
      } catch {
        // Ignore cleanup errors
      }
      this.activeHtmlAudio.delete(id);
    }
  }

  private startSynthMusic(id: MusicTrackId, volume: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (this.activeSynthMusic.has(id)) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    masterGain.gain.setTargetAtTime(Math.max(0.01, volume) * 0.16, ctx.currentTime, 0.25);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = id === 'track1' ? 720 : 520;
    lowpass.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Track 1: Warm Lo-Fi electric-piano chord progression (Fmaj7 -> Em7 -> Dm7 -> Cmaj7)
    // Track 2: Slow serene ambient pad chords (Cmaj9 -> Am9)
    const chords =
      id === 'track1'
        ? [
            [174.61, 220.0, 261.63, 329.63], // Fmaj7
            [164.81, 196.0, 246.94, 293.66], // Em7
            [146.83, 174.61, 220.0, 261.63], // Dm7
            [130.81, 164.81, 196.0, 246.94], // Cmaj7
          ]
        : [
            [130.81, 196.0, 246.94, 293.66], // Cmaj9
            [110.0, 164.81, 196.0, 246.94], // Am9
          ];

    let step = 0;
    const stepMs = id === 'track1' ? 2400 : 3800;

    const playChord = () => {
      if (!this.ctx || !this.activeSynthMusic.has(id)) return;
      const now = this.ctx.currentTime;
      const chord = chords[step % chords.length];
      step += 1;

      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const voiceGain = this.ctx.createGain();
        osc.type = id === 'track1' ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const attack = id === 'track1' ? 0.12 + idx * 0.04 : 0.8;
        const duration = stepMs / 1000;

        voiceGain.gain.setValueAtTime(0.0001, now);
        voiceGain.gain.linearRampToValueAtTime(0.24, now + attack);
        voiceGain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

        osc.connect(voiceGain);
        voiceGain.connect(lowpass);

        osc.start(now);
        osc.stop(now + duration + 0.05);
      });
    };

    playChord();
    const intervalId = window.setInterval(playChord, stepMs);
    this.activeSynthMusic.set(id, { intervalId, masterGain, nodes: [lowpass, masterGain] });
  }

  private stopMusicTrack(id: MusicTrackId): void {
    this.stopHtmlAudio(id);

    const synth = this.activeSynthMusic.get(id);
    if (synth) {
      window.clearInterval(synth.intervalId);
      if (this.ctx) {
        try {
          synth.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.08);
        } catch {
          // Ignore teardown errors
        }
      }
      this.activeSynthMusic.delete(id);
    }
  }

  public playChime(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.14;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.11, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 1.15);
    });
  }

  public stopAll(): void {
    this.setChannel('rain', false, 0);
    this.setChannel('breeze', false, 0);
    this.stopMusicTrack('track1');
    this.stopMusicTrack('track2');
  }
}

export const soundEngine = new SoundEngine();
