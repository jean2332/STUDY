// Synthesized gentle ambient soundscapes and completion chime via Web Audio API.
// Zero external MP3 dependencies so audio works reliably offline and in sandboxes.

type ChannelId = 'rain' | 'breeze';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private activeChannels: Map<
    ChannelId,
    { source: AudioBufferSourceNode; gain: GainNode; filter: BiquadFilterNode }
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

  private createNoiseBuffer(ctx: AudioContext, type: ChannelId): AudioBuffer {
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'rain') {
        // Soft brown-pink blend for gentle rain texture
        lastOut = (lastOut + 0.035 * white) / 1.035;
        data[i] = lastOut * 2.4 + white * 0.04;
      } else {
        // Deeper smooth brown noise for quiet breeze
        lastOut = (lastOut + 0.018 * white) / 1.018;
        data[i] = lastOut * 3.1;
      }
    }
    return buffer;
  }

  public setChannel(id: ChannelId, enabled: boolean, volume: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const existing = this.activeChannels.get(id);

    if (!enabled) {
      if (existing) {
        try {
          existing.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
          setTimeout(() => {
            try {
              existing.source.stop();
              existing.source.disconnect();
            } catch {
              // Ignore already stopped source
            }
          }, 180);
        } catch {
          // Ignore audio teardown errors
        }
        this.activeChannels.delete(id);
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

    this.activeChannels.set(id, { source, gain, filter });
  }

  public playChime(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 gentle triad
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
  }
}

export const soundEngine = new SoundEngine();
