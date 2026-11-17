import React, { useMemo, useState } from 'react';
import {
  Check,
  ChevronRight,
  Maximize2,
  Minimize2,
  Music2,
  Pause,
  Play,
  Plus,
  RotateCcw,
} from 'lucide-react';
import {
  CloudMood,
  StudyCircleRoom,
  StudyTask,
  TimerMode,
  TimerPreset,
} from '../types/study';
import { CloudMascot } from './CloudMascot';
import { BottomSheet } from './BottomSheet';
import { AudioState } from './AudioBottomSheet';

export const TIMER_PRESETS: Record<TimerMode, TimerPreset> = {
  [TimerMode.FOCUS]: {
    mode: TimerMode.FOCUS,
    label: 'Enfoque 25m',
    shortLabel: '25 min',
    minutes: 25,
    isBreak: false,
    description: 'Bloque clásico para avanzar con claridad.',
  },
  [TimerMode.DEEP]: {
    mode: TimerMode.DEEP,
    label: 'Profundo 50m',
    shortLabel: '50 min',
    minutes: 50,
    isBreak: false,
    description: 'Sesión extendida para lectura o práctica intensa.',
  },
  [TimerMode.SHORT_BREAK]: {
    mode: TimerMode.SHORT_BREAK,
    label: 'Pausa 5m',
    shortLabel: '5 min',
    minutes: 5,
    isBreak: true,
    description: 'Estira las piernas y toma un respiro.',
  },
  [TimerMode.LONG_BREAK]: {
    mode: TimerMode.LONG_BREAK,
    label: 'Descanso 15m',
    shortLabel: '15 min',
    minutes: 15,
    isBreak: true,
    description: 'Pausa larga después de varios bloques.',
  },
};

const ENCOURAGEMENTS = [
  '¡Tú puedes con este bloque!',
  'Un paso tranquilo a la vez.',
  'Respira hondo, vas muy bien.',
  'Tu constancia construye calma.',
  'Aquí estoy estudiando contigo.',
];

interface StudyTabProps {
  mode: TimerMode;
  onModeChange: (nextMode: TimerMode) => void;
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  justCelebrated: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  onAddFiveMinutes: () => void;
  onCompleteBlock: () => void;
  tasks: StudyTask[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onGoToTasks: () => void;
  activeCircle: StudyCircleRoom | null;
  onLeaveCircle: () => void;
  audio: AudioState;
  onOpenAudioSheet: () => void;
  zenMode: boolean;
  onToggleZenMode: () => void;
}

export const StudyTab: React.FC<StudyTabProps> = ({
  mode,
  onModeChange,
  secondsLeft,
  totalSeconds,
  isRunning,
  justCelebrated,
  onToggleRun,
  onReset,
  onAddFiveMinutes,
  onCompleteBlock,
  tasks,
  selectedTaskId,
  onSelectTask,
  onGoToTasks,
  activeCircle,
  onLeaveCircle,
  audio,
  onOpenAudioSheet,
  zenMode,
  onToggleZenMode,
}) => {
  const [speechText, setSpeechText] = useState<string | null>(null);
  const [taskSheetOpen, setTaskSheetOpen] = useState(false);

  const preset = TIMER_PRESETS[mode];
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  const cloudMood: CloudMood = useMemo(() => {
    if (justCelebrated) return CloudMood.CELEBRATE;
    if (preset.isBreak) return CloudMood.BREAK;
    if (isRunning) return CloudMood.FOCUS;
    return CloudMood.IDLE;
  }, [justCelebrated, preset.isBreak, isRunning]);

  const formattedTime = useMemo(() => {
    const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const secs = String(secondsLeft % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  }, [secondsLeft]);

  const progressRatio =
    totalSeconds > 0 ? Math.max(0, Math.min(1, 1 - secondsLeft / totalSeconds)) : 0;
  const ringRadius = 88;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference * (1 - progressRatio);

  const handlePetCloud = () => {
    const randomLine = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
    setSpeechText(randomLine);
    window.setTimeout(() => setSpeechText(null), 2800);
  };

  const activeAudioLabels: string[] = [];
  if (audio.track1On) activeAudioLabels.push('Lo-Fi');
  if (audio.track2On) activeAudioLabels.push('Ambiental');
  if (audio.rainOn) activeAudioLabels.push('Lluvia');
  if (audio.breezeOn) activeAudioLabels.push('Brisa');

  return (
    <div className={`px-4 py-4 space-y-4 ${zenMode ? 'min-h-full flex flex-col justify-center py-8' : ''}`}>
      {/* Active Circle Status Banner */}
      {activeCircle && !zenMode && (
        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/80">
          <div className="min-w-0">
            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
              En círculo: <strong className="font-semibold text-slate-900 dark:text-slate-100">{activeCircle.name}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onLeaveCircle}
            className="min-h-[36px] px-2.5 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:underline shrink-0 cursor-pointer"
          >
            Salir
          </button>
        </div>
      )}

      {/* Mode Selector (hidden in Zen Mode if running, or kept cleanly accessible) */}
      {!zenMode && (
        <div
          role="tablist"
          aria-label="Modos del temporizador"
          className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/75 dark:bg-slate-800 rounded-2xl"
        >
          {Object.values(TIMER_PRESETS).map((item) => {
            const active = item.mode === mode;
            return (
              <button
                key={item.mode}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => onModeChange(item.mode)}
                className={`min-h-[44px] px-3 py-2 text-xs font-semibold rounded-xl transition-colors duration-150 whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  active
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Focus Card */}
      <div className="relative bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col items-center shadow-xs">
        {/* Zen Mode Toggle */}
        <div className="w-full flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            {preset.isBreak ? 'Tiempo de descanso' : 'Bloque de enfoque'}
          </span>
          <button
            type="button"
            onClick={onToggleZenMode}
            aria-label={zenMode ? 'Salir de Modo Enfoque Zen' : 'Activar Modo Enfoque Zen'}
            aria-pressed={zenMode}
            className="min-h-[44px] px-3 -mr-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            {zenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{zenMode ? 'Salir Zen' : 'Modo Zen'}</span>
          </button>
        </div>

        {/* Cloud Mascot */}
        <CloudMascot
          mood={cloudMood}
          size="md"
          interactive
          onPet={handlePetCloud}
          speechText={speechText}
        />

        {/* Circular Pomodoro Ring */}
        <div className="relative flex items-center justify-center w-[204px] h-[204px] my-1">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 204 204" aria-hidden="true">
            <circle
              cx="102"
              cy="102"
              r={ringRadius}
              fill="none"
              className="stroke-slate-200 dark:stroke-slate-700"
              strokeWidth="8"
            />
            <circle
              cx="102"
              cy="102"
              r={ringRadius}
              fill="none"
              className={preset.isBreak ? 'stroke-sky-400' : 'stroke-sky-600 dark:stroke-sky-500'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <div
              aria-live="off"
              className="font-mono text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 tabular-nums"
            >
              {formattedTime}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-[140px] truncate">
              {selectedTask ? selectedTask.title : 'Sesión libre'}
            </p>
          </div>
        </div>

        {/* Primary & Secondary Timer Controls */}
        <div className="w-full mt-3 space-y-2.5">
          <button
            type="button"
            onClick={onToggleRun}
            className="w-full min-h-[48px] px-6 py-3 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 active:scale-[0.98] rounded-2xl shadow-xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>{secondsLeft < totalSeconds ? 'Continuar' : 'Iniciar'}</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onReset}
              className="min-h-[44px] px-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar</span>
            </button>

            <button
              type="button"
              onClick={onAddFiveMinutes}
              className="min-h-[44px] px-2 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              +5 min
            </button>

            <button
              type="button"
              onClick={onCompleteBlock}
              className="min-h-[44px] px-2 flex items-center justify-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Completar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Active Task Selector + Compact Audio Trigger (hidden in Zen Mode) */}
      {!zenMode && (
        <div className="space-y-3">
          {/* Quick Task Selector Card */}
          <button
            type="button"
            onClick={() => setTaskSheetOpen(true)}
            className="w-full min-h-[56px] px-4 py-3 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-left hover:border-sky-300 dark:hover:border-sky-700 transition-colors cursor-pointer"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Tarea enfocada
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {selectedTask ? `${selectedTask.subject} · ${selectedTask.title}` : 'Seleccionar tarea o materia'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
          </button>

          {/* Compact Audio & Music Card */}
          <button
            type="button"
            onClick={onOpenAudioSheet}
            className="w-full min-h-[56px] px-4 py-3 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-left hover:border-sky-300 dark:hover:border-sky-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  activeAudioLabels.length > 0
                    ? 'bg-sky-600 text-white'
                    : 'bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-300'
                }`}
              >
                <Music2 className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  Audio y Música
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {activeAudioLabels.length > 0
                    ? `Activo: ${activeAudioLabels.join(' · ')}`
                    : 'Lo-Fi, Ambiental, Lluvia y Brisa'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
          </button>
        </div>
      )}

      {/* Quick Task Picker Bottom Sheet */}
      <BottomSheet
        open={taskSheetOpen}
        onClose={() => setTaskSheetOpen(false)}
        title="Elegir tarea activa"
      >
        <div className="space-y-2">
          {tasks.filter((t) => !t.completed).length === 0 ? (
            <p className="py-4 text-sm text-slate-500 dark:text-slate-400 text-center">
              No tienes tareas pendientes todavía.
            </p>
          ) : (
            tasks
              .filter((t) => !t.completed)
              .map((task) => {
                const isSelected = task.id === selectedTaskId;
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => {
                      onSelectTask(task.id);
                      setTaskSheetOpen(false);
                    }}
                    className={`w-full min-h-[52px] px-4 py-3 rounded-2xl border flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500'
                        : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {task.subject} · <span className="font-mono tabular-nums">{task.pomodorosDone}/{task.pomodorosTarget}</span> bloques
                      </p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />}
                  </button>
                );
              })
          )}

          <button
            type="button"
            onClick={() => {
              setTaskSheetOpen(false);
              onGoToTasks();
            }}
            className="w-full min-h-[48px] mt-2 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-sky-600 text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Administrar o agregar tareas</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};
