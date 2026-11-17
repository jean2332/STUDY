import React from 'react';
import { Bell, BellOff, CloudRain, Disc3, Music2, Pause, Play, Wind } from 'lucide-react';
import { BottomSheet } from './BottomSheet';

export interface AudioState {
  track1On: boolean;
  track1Vol: number;
  track2On: boolean;
  track2Vol: number;
  rainOn: boolean;
  rainVol: number;
  breezeOn: boolean;
  breezeVol: number;
  chimeEnabled: boolean;
}

interface AudioBottomSheetProps {
  open: boolean;
  onClose: () => void;
  audio: AudioState;
  onChange: (patch: Partial<AudioState>) => void;
}

export const AudioBottomSheet: React.FC<AudioBottomSheetProps> = ({
  open,
  onClose,
  audio,
  onChange,
}) => {
  return (
    <BottomSheet open={open} onClose={onClose} title="Audio y Música en bucle">
      <div className="space-y-6">
        {/* Background Music Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xs font-semibold text-slate-500 dark:text-slate-400">
              Música de fondo (puedes combinarla con los sonidos)
            </h3>
          </div>

          {/* Track 1: /audio/track1.mp3 */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0">
                  <Music2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    Enfoque Lo-Fi
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Bucle suave para estudiar
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onChange({ track1On: !audio.track1On })}
                aria-pressed={audio.track1On}
                aria-label={audio.track1On ? 'Pausar Enfoque Lo-Fi' : 'Reproducir Enfoque Lo-Fi'}
                className={`min-h-[44px] min-w-[44px] px-3.5 flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  audio.track1On
                    ? 'bg-sky-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {audio.track1On ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{audio.track1On ? 'Pausar' : 'Sonar'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 w-9 tabular-nums">
                {Math.round(audio.track1Vol * 100)}%
              </span>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={audio.track1Vol}
                onChange={(e) => onChange({ track1Vol: parseFloat(e.target.value) })}
                aria-label="Volumen de Enfoque Lo-Fi"
                className="flex-1 h-2 accent-sky-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Track 2: /audio/track2.mp3 */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0">
                  <Disc3 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    Pausa Ambiental
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Acordes cálidos en bucle
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onChange({ track2On: !audio.track2On })}
                aria-pressed={audio.track2On}
                aria-label={audio.track2On ? 'Pausar Pausa Ambiental' : 'Reproducir Pausa Ambiental'}
                className={`min-h-[44px] min-w-[44px] px-3.5 flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  audio.track2On
                    ? 'bg-sky-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {audio.track2On ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{audio.track2On ? 'Pausar' : 'Sonar'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 w-9 tabular-nums">
                {Math.round(audio.track2Vol * 100)}%
              </span>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={audio.track2Vol}
                onChange={(e) => onChange({ track2Vol: parseFloat(e.target.value) })}
                aria-label="Volumen de Pausa Ambiental"
                className="flex-1 h-2 accent-sky-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Ambient Noise Section */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-display text-xs font-semibold text-slate-500 dark:text-slate-400">
            Sonidos ambientales
          </h3>

          {/* Rain */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                  <CloudRain className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Lluvia suave
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onChange({ rainOn: !audio.rainOn })}
                aria-pressed={audio.rainOn}
                className={`min-h-[44px] min-w-[44px] px-3.5 flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  audio.rainOn
                    ? 'bg-sky-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {audio.rainOn ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{audio.rainOn ? 'Pausar' : 'Sonar'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 w-9 tabular-nums">
                {Math.round(audio.rainVol * 100)}%
              </span>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={audio.rainVol}
                onChange={(e) => onChange({ rainVol: parseFloat(e.target.value) })}
                aria-label="Volumen de lluvia suave"
                className="flex-1 h-2 accent-sky-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Breeze */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                  <Wind className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Brisa tranquila
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onChange({ breezeOn: !audio.breezeOn })}
                aria-pressed={audio.breezeOn}
                className={`min-h-[44px] min-w-[44px] px-3.5 flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  audio.breezeOn
                    ? 'bg-sky-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {audio.breezeOn ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{audio.breezeOn ? 'Pausar' : 'Sonar'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 w-9 tabular-nums">
                {Math.round(audio.breezeVol * 100)}%
              </span>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={audio.breezeVol}
                onChange={(e) => onChange({ breezeVol: parseFloat(e.target.value) })}
                aria-label="Volumen de brisa tranquila"
                className="flex-1 h-2 accent-sky-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Completion chime toggle */}
        <button
          type="button"
          onClick={() => onChange({ chimeEnabled: !audio.chimeEnabled })}
          className="w-full min-h-[48px] px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            {audio.chimeEnabled ? (
              <Bell className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            ) : (
              <BellOff className="w-4 h-4 text-slate-400" />
            )}
            <span>Campana al terminar el bloque</span>
          </span>
          <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
            {audio.chimeEnabled ? 'Activa' : 'Silenciada'}
          </span>
        </button>
      </div>
    </BottomSheet>
  );
};
