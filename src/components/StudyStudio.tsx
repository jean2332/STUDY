import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  CloudRain,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Trash2,
  Volume2,
  VolumeX,
  Wind,
} from 'lucide-react';
import {
  CloudMood,
  DailyProgress,
  StudyCircleRoom,
  StudyTask,
  TimerMode,
  TimerPreset,
} from '../types/study';
import { CloudMascot } from './CloudMascot';
import { soundEngine } from '../utils/soundEngine';

export const TIMER_PRESETS: Record<TimerMode, TimerPreset> = {
  [TimerMode.FOCUS]: {
    mode: TimerMode.FOCUS,
    label: 'Enfoque 25m',
    minutes: 25,
    isBreak: false,
    description: 'Bloque clásico para avanzar con claridad.',
  },
  [TimerMode.DEEP]: {
    mode: TimerMode.DEEP,
    label: 'Profundo 50m',
    minutes: 50,
    isBreak: false,
    description: 'Sesión extendida para lectura o práctica intensa.',
  },
  [TimerMode.SHORT_BREAK]: {
    mode: TimerMode.SHORT_BREAK,
    label: 'Pausa 5m',
    minutes: 5,
    isBreak: true,
    description: 'Estira las piernas y toma un respiro.',
  },
  [TimerMode.LONG_BREAK]: {
    mode: TimerMode.LONG_BREAK,
    label: 'Descanso 15m',
    minutes: 15,
    isBreak: true,
    description: 'Pausa larga después de varios bloques.',
  },
};

const SUBJECT_OPTIONS = [
  'General',
  'Matemáticas',
  'Ciencias',
  'Idiomas',
  'Lectura',
  'Programación',
  'Historia',
];

const ENCOURAGEMENTS = [
  '¡Tú puedes con este bloque!',
  'Un paso tranquilo a la vez.',
  'Respira hondo, vas muy bien.',
  'Tu constancia construye calma.',
  'Aquí estoy estudiando contigo.',
];

const DEFAULT_TASKS: StudyTask[] = [
  {
    id: 'task-1',
    title: 'Resumen del capítulo 3',
    subject: 'Lectura',
    completed: false,
    pomodorosDone: 1,
    pomodorosTarget: 2,
  },
  {
    id: 'task-2',
    title: 'Ejercicios de derivadas',
    subject: 'Matemáticas',
    completed: false,
    pomodorosDone: 0,
    pomodorosTarget: 3,
  },
];

function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

interface StudyStudioProps {
  mode: TimerMode;
  onModeChange: (nextMode: TimerMode) => void;
  activeCircle: StudyCircleRoom | null;
  onLeaveCircle: () => void;
  focusTrigger: number;
}

export const StudyStudio: React.FC<StudyStudioProps> = ({
  mode,
  onModeChange,
  activeCircle,
  onLeaveCircle,
  focusTrigger,
}) => {
  const preset = TIMER_PRESETS[mode];
  const [secondsLeft, setSecondsLeft] = useState(preset.minutes * 60);
  const [totalSeconds, setTotalSeconds] = useState(preset.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [justCelebrated, setJustCelebrated] = useState(false);
  const [speechText, setSpeechText] = useState<string | null>(null);

  // Tasks & active focus target
  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    try {
      const raw = localStorage.getItem('nubecircle_tasks_v1');
      if (raw) {
        const parsed = JSON.parse(raw) as StudyTask[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore storage errors
    }
    return DEFAULT_TASKS;
  });

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(() => tasks[0]?.id ?? null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('General');
  const [taskError, setTaskError] = useState('');

  // Daily progress
  const [progress, setProgress] = useState<DailyProgress>(() => {
    const today = getTodayKey();
    try {
      const raw = localStorage.getItem('nubecircle_progress_v1');
      if (raw) {
        const parsed = JSON.parse(raw) as DailyProgress;
        if (parsed.dateKey === today) return parsed;
        // Preserve streak if continuing on a new day
        return {
          dateKey: today,
          focusedMinutes: 0,
          completedBlocks: 0,
          streakDays: parsed.completedBlocks > 0 ? parsed.streakDays : 1,
        };
      }
    } catch {
      // Ignore storage errors
    }
    return {
      dateKey: today,
      focusedMinutes: 0,
      completedBlocks: 0,
      streakDays: 1,
    };
  });

  // Ambient Soundscape state
  const [rainOn, setRainOn] = useState(false);
  const [rainVol, setRainVol] = useState(0.55);
  const [breezeOn, setBreezeOn] = useState(false);
  const [breezeVol, setBreezeVol] = useState(0.45);
  const [chimeEnabled, setChimeEnabled] = useState(true);

  const speechTimeoutRef = useRef<number | null>(null);
  const taskInputRef = useRef<HTMLInputElement | null>(null);

  // Persist tasks and progress
  useEffect(() => {
    try {
      localStorage.setItem('nubecircle_tasks_v1', JSON.stringify(tasks));
    } catch {
      // Ignore storage errors
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('nubecircle_progress_v1', JSON.stringify(progress));
    } catch {
      // Ignore storage errors
    }
  }, [progress]);

  // Sync timer when mode changes externally or via tabs
  useEffect(() => {
    const nextSeconds = TIMER_PRESETS[mode].minutes * 60;
    setIsRunning(false);
    setJustCelebrated(false);
    setSecondsLeft(nextSeconds);
    setTotalSeconds(nextSeconds);
  }, [mode]);

  // Smoothly focus timer when CTA clicked
  useEffect(() => {
    if (focusTrigger > 0) {
      setSpeechText('¡Listos para empezar!');
      if (speechTimeoutRef.current) window.clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = window.setTimeout(() => setSpeechText(null), 2600);
    }
  }, [focusTrigger]);

  // Sound engine sync
  useEffect(() => {
    soundEngine.setChannel('rain', rainOn, rainVol);
  }, [rainOn, rainVol]);

  useEffect(() => {
    soundEngine.setChannel('breeze', breezeOn, breezeVol);
  }, [breezeOn, breezeVol]);

  useEffect(() => {
    return () => {
      soundEngine.stopAll();
    };
  }, []);

  // Countdown tick
  useEffect(() => {
    if (!isRunning) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          handleCompleteBlock();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, mode, selectedTaskId, chimeEnabled]);

  // Update document title while running
  useEffect(() => {
    if (isRunning) {
      const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
      const secs = String(secondsLeft % 60).padStart(2, '0');
      document.title = `${mins}:${secs} · NubeCircle`;
    } else {
      document.title = 'NubeCircle — Estudio en calma con tu compañera nube';
    }
  }, [isRunning, secondsLeft]);

  const showCloudMessage = (msg: string) => {
    setSpeechText(msg);
    if (speechTimeoutRef.current) window.clearTimeout(speechTimeoutRef.current);
    speechTimeoutRef.current = window.setTimeout(() => setSpeechText(null), 3200);
  };

  const handleCompleteBlock = () => {
    setIsRunning(false);
    setJustCelebrated(true);
    if (chimeEnabled) {
      soundEngine.playChime();
    }

    if (!preset.isBreak) {
      const earnedMinutes = Math.max(1, Math.round(totalSeconds / 60));
      setProgress((prev) => ({
        dateKey: getTodayKey(),
        focusedMinutes: prev.focusedMinutes + earnedMinutes,
        completedBlocks: prev.completedBlocks + 1,
        streakDays: Math.max(1, prev.streakDays),
      }));

      if (selectedTaskId) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === selectedTaskId ? { ...t, pomodorosDone: t.pomodorosDone + 1 } : t
          )
        );
      }
      showCloudMessage('¡Bloque completado! Tómate un respiro.');
    } else {
      showCloudMessage('Descanso listo. ¿Volvemos al estudio?');
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setJustCelebrated(false);
    const resetSecs = preset.minutes * 60;
    setSecondsLeft(resetSecs);
    setTotalSeconds(resetSecs);
  };

  const handleAddFiveMinutes = () => {
    setSecondsLeft((prev) => prev + 300);
    setTotalSeconds((prev) => prev + 300);
    setJustCelebrated(false);
  };

  const handlePetCloud = () => {
    const randomLine = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
    showCloudMessage(randomLine);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTaskTitle.trim();
    if (!trimmed) {
      setTaskError('Escribe un tema o tarea antes de agregar.');
      taskInputRef.current?.focus();
      return;
    }
    setTaskError('');
    const newTask: StudyTask = {
      id: `task-${Date.now()}`,
      title: trimmed,
      subject: newTaskSubject,
      completed: false,
      pomodorosDone: 0,
      pomodorosTarget: 2,
    };
    setTasks((prev) => [newTask, ...prev]);
    setSelectedTaskId(newTask.id);
    setNewTaskTitle('');
  };

  const toggleTaskDone = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (selectedTaskId === id) {
        setSelectedTaskId(filtered[0]?.id ?? null);
      }
      return filtered;
    });
  };

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

  const progressRatio = totalSeconds > 0 ? Math.max(0, Math.min(1, 1 - secondsLeft / totalSeconds)) : 0;
  const ringRadius = 112;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference * (1 - progressRatio);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  return (
    <section id="estudio" className="py-12 lg:py-20 bg-white border-y border-slate-200/80">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">Espacio de trabajo web</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Tu escritorio de enfoque
            </h2>
          </div>

          {activeCircle && (
            <div className="flex items-center gap-3 text-sm text-slate-600 bg-sky-50/70 border border-sky-200/80 rounded-xl px-4 py-2">
              <span>
                En círculo: <strong className="font-semibold text-slate-900">{activeCircle.name}</strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">|</span>
              <button
                type="button"
                onClick={onLeaveCircle}
                className="text-xs font-semibold text-sky-700 hover:text-sky-900 underline underline-offset-2 cursor-pointer"
              >
                Salir del círculo
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 columns: Main Focus Timer & Interactive Cloud Mascot */}
          <div className="lg:col-span-7 bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col items-center">
            {/* Mode segmented tabs */}
            <div
              role="tablist"
              aria-label="Modos del temporizador"
              className="w-full max-w-lg grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-200/70 rounded-xl"
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
                    className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-xs text-slate-500 text-center">{preset.description}</p>

            {/* Interactive Cloud Mascot + Countdown Ring */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 w-full">
              <div className="flex flex-col items-center">
                <CloudMascot
                  mood={cloudMood}
                  size="lg"
                  interactive
                  onPet={handlePetCloud}
                  speechText={speechText}
                />
                <span className="mt-1 text-xs text-slate-500">
                  {cloudMood === CloudMood.FOCUS
                    ? 'Modo enfoque · Toca para ánimo'
                    : cloudMood === CloudMood.BREAK
                      ? 'En pausa · Toca para saludar'
                      : cloudMood === CloudMood.CELEBRATE
                        ? 'Meta lograda · ¡Bien hecho!'
                        : 'Lista para estudiar · Tócame'}
                </span>
              </div>

              {/* Circular Progress & Monospace Clock */}
              <div className="relative flex items-center justify-center w-60 h-60 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 250 250" aria-hidden="true">
                  <circle
                    cx="125"
                    cy="125"
                    r={ringRadius}
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="125"
                    cy="125"
                    r={ringRadius}
                    fill="none"
                    stroke={preset.isBreak ? '#0EA5E9' : '#0284C7'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-[stroke-dashoffset] duration-500 ease-out"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <span className="text-xs font-medium text-slate-500">
                    {preset.isBreak ? 'Tiempo de descanso' : 'Tiempo de enfoque'}
                  </span>
                  <div
                    aria-live="off"
                    className="font-mono text-5xl font-semibold tracking-tight text-slate-900 tabular-nums mt-1"
                  >
                    {formattedTime}
                  </div>
                  <p className="mt-2 text-xs text-slate-600 max-w-[160px] truncate">
                    {selectedTask
                      ? `${selectedTask.subject}: ${selectedTask.title}`
                      : 'Sesión libre'}
                  </p>
                </div>
              </div>
            </div>

            {/* Plain-language Controls */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setJustCelebrated(false);
                  setIsRunning((prev) => !prev);
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors duration-150 min-w-[148px] whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
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

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reiniciar</span>
              </button>

              <button
                type="button"
                onClick={handleAddFiveMinutes}
                className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                +5 min
              </button>

              <button
                type="button"
                onClick={handleCompleteBlock}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <Check className="w-4 h-4 text-sky-600" />
                <span>Completar</span>
              </button>
            </div>
          </div>

          {/* Right 5 columns: Progress, Tasks & Ambient Sounds */}
          <div className="lg:col-span-5 space-y-6">
            {/* Daily Metrics Strip (no cards inside cards, clean hairlines) */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base font-semibold text-slate-900">
                  Resumen de hoy
                </h3>
                <span className="text-xs text-slate-500">Guardado automático</span>
              </div>

              <div className="grid grid-cols-3 divide-x divide-slate-200">
                <div className="pr-4">
                  <div className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                    {progress.focusedMinutes}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Minutos</div>
                </div>
                <div className="px-4">
                  <div className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                    {progress.completedBlocks}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Bloques</div>
                </div>
                <div className="pl-4">
                  <div className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                    {progress.streakDays} d
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Racha activa</div>
                </div>
              </div>
            </div>

            {/* Subject & Task Planner */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6">
              <h3 className="font-display text-base font-semibold text-slate-900 mb-4">
                Materias y tareas
              </h3>

              <form onSubmit={handleAddTask} className="space-y-2.5 mb-4">
                <div className="flex gap-2">
                  <input
                    ref={taskInputRef}
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => {
                      setNewTaskTitle(e.target.value);
                      if (taskError) setTaskError('');
                    }}
                    placeholder="¿Qué vas a estudiar ahora?"
                    aria-label="Nueva tarea de estudio"
                    className="flex-1 min-w-0 px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="submit"
                    aria-label="Agregar tarea"
                    className="inline-flex items-center justify-center gap-1 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <span>Materia:</span>
                    <select
                      value={newTaskSubject}
                      onChange={(e) => setNewTaskSubject(e.target.value)}
                      className="px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {SUBJECT_OPTIONS.map((subj) => (
                        <option key={subj} value={subj}>
                          {subj}
                        </option>
                      ))}
                    </select>
                  </label>
                  {taskError && <span className="text-xs text-rose-600">{taskError}</span>}
                </div>
              </form>

              {tasks.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500 border-t border-slate-200">
                  No hay tareas todavía. Agrega una materia arriba para enfocar tu bloque.
                </p>
              ) : (
                <ul className="divide-y divide-slate-200 border-t border-slate-200 max-h-[250px] overflow-y-auto">
                  {tasks.map((task) => {
                    const isSelected = task.id === selectedTaskId;
                    return (
                      <li
                        key={task.id}
                        className={`py-3 flex items-center justify-between gap-3 transition-colors ${
                          isSelected ? 'bg-sky-50/70 -mx-3 px-3 rounded-xl' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => toggleTaskDone(task.id)}
                            aria-label={
                              task.completed
                                ? `Marcar "${task.title}" como pendiente`
                                : `Marcar "${task.title}" como completada`
                            }
                            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                              task.completed
                                ? 'bg-sky-600 border-sky-600 text-white'
                                : 'bg-white border-slate-300 hover:border-sky-500'
                            }`}
                          >
                            {task.completed && <Check className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedTaskId(task.id)}
                            className="text-left min-w-0 flex-1 cursor-pointer focus:outline-none"
                          >
                            <p
                              className={`text-sm font-medium truncate ${
                                task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                              }`}
                            >
                              {task.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              <span>{task.subject}</span>
                              <span aria-hidden="true"> · </span>
                              <span className="font-mono tabular-nums">
                                {task.pomodorosDone}/{task.pomodorosTarget} bloques
                              </span>
                              {isSelected && !task.completed && (
                                <>
                                  <span aria-hidden="true"> · </span>
                                  <span className="font-medium text-sky-700">En curso</span>
                                </>
                              )}
                            </p>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          aria-label={`Eliminar "${task.title}"`}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Ambient Sound Mixer */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base font-semibold text-slate-900">
                  Ambiente sonoro
                </h3>
                <button
                  type="button"
                  onClick={() => setChimeEnabled((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  {chimeEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{chimeEnabled ? 'Campana activa' : 'Campana silenciada'}</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Rain control */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setRainOn((prev) => !prev)}
                    aria-pressed={rainOn}
                    className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      rainOn
                        ? 'bg-sky-600 border-sky-600 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CloudRain className="w-4 h-4" />
                    <span>Lluvia suave</span>
                  </button>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={rainVol}
                    disabled={!rainOn}
                    onChange={(e) => setRainVol(parseFloat(e.target.value))}
                    aria-label="Volumen de lluvia suave"
                    className="flex-1 accent-sky-600 disabled:opacity-40 cursor-pointer"
                  />
                </div>

                {/* Breeze control */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setBreezeOn((prev) => !prev)}
                    aria-pressed={breezeOn}
                    className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      breezeOn
                        ? 'bg-sky-600 border-sky-600 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Wind className="w-4 h-4" />
                    <span>Brisa tranquila</span>
                  </button>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={breezeVol}
                    disabled={!breezeOn}
                    onChange={(e) => setBreezeVol(parseFloat(e.target.value))}
                    aria-label="Volumen de brisa tranquila"
                    className="flex-1 accent-sky-600 disabled:opacity-40 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
