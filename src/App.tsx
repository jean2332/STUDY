/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppHeader } from './components/AppHeader';
import { BottomNav } from './components/BottomNav';
import { HelpModal } from './components/HelpModal';
import { AudioBottomSheet, AudioState } from './components/AudioBottomSheet';
import { StudyTab, TIMER_PRESETS } from './components/StudyTab';
import { TasksTab } from './components/TasksTab';
import { CirclesTab, INITIAL_CIRCLE_ROOMS } from './components/CirclesTab';
import { ProgressTab } from './components/ProgressTab';
import {
  AppTab,
  CloudMood,
  DailyProgress,
  StudyCircleRoom,
  StudyTask,
  TimerMode,
  WeeklyHistoryRecord,
} from './types/study';
import { soundEngine } from './utils/soundEngine';

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

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.STUDY);
  const [zenMode, setZenMode] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [audioSheetOpen, setAudioSheetOpen] = useState(false);

  // Light / Dark Theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nubecircle_theme_v1');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', isDark ? '#0F172A' : '#F8FAFC');
    }
    try {
      localStorage.setItem('nubecircle_theme_v1', isDark ? 'dark' : 'light');
    } catch {
      // Ignore storage errors
    }
  }, [isDark]);

  // Persistent Timer State (lives at root so switching tabs never resets clock)
  const [timerMode, setTimerMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_PRESETS[TimerMode.FOCUS].minutes * 60);
  const [totalSeconds, setTotalSeconds] = useState(TIMER_PRESETS[TimerMode.FOCUS].minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [justCelebrated, setJustCelebrated] = useState(false);

  // Tasks & Active Task
  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    try {
      const raw = localStorage.getItem('nubecircle_tasks_v1');
      if (raw) {
        const parsed = JSON.parse(raw) as StudyTask[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage errors
    }
    return DEFAULT_TASKS;
  });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(() => tasks[0]?.id ?? null);

  useEffect(() => {
    try {
      localStorage.setItem('nubecircle_tasks_v1', JSON.stringify(tasks));
    } catch {
      // Ignore storage errors
    }
  }, [tasks]);

  // Daily Progress & 7-Day History
  const [progress, setProgress] = useState<DailyProgress>(() => {
    const today = getTodayKey();
    try {
      const raw = localStorage.getItem('nubecircle_progress_v1');
      if (raw) {
        const parsed = JSON.parse(raw) as DailyProgress;
        if (parsed.dateKey === today) return parsed;
        return {
          dateKey: today,
          focusedMinutes: 0,
          completedBlocks: 0,
          streakDays: parsed.completedBlocks > 0 ? parsed.streakDays + 1 : 1,
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

  const [history, setHistory] = useState<WeeklyHistoryRecord>(() => {
    try {
      const raw = localStorage.getItem('nubecircle_history_v1');
      if (raw) {
        return JSON.parse(raw) as WeeklyHistoryRecord;
      }
    } catch {
      // Ignore storage errors
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem('nubecircle_progress_v1', JSON.stringify(progress));
      const updatedHistory: WeeklyHistoryRecord = {
        ...history,
        [progress.dateKey]: {
          focusedMinutes: progress.focusedMinutes,
          completedBlocks: progress.completedBlocks,
        },
      };
      localStorage.setItem('nubecircle_history_v1', JSON.stringify(updatedHistory));
    } catch {
      // Ignore storage errors
    }
  }, [progress, history]);

  // Circles State
  const [rooms, setRooms] = useState<StudyCircleRoom[]>(() => {
    try {
      const raw = localStorage.getItem('nubecircle_custom_rooms_v1');
      if (raw) {
        const custom = JSON.parse(raw) as StudyCircleRoom[];
        if (Array.isArray(custom) && custom.length > 0) {
          return [...custom, ...INITIAL_CIRCLE_ROOMS];
        }
      }
    } catch {
      // Ignore storage errors
    }
    return INITIAL_CIRCLE_ROOMS;
  });

  const [activeCircle, setActiveCircle] = useState<StudyCircleRoom | null>(null);
  const [hasJoinedCircle, setHasJoinedCircle] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nubecircle_joined_once_v1') === '1';
    } catch {
      return false;
    }
  });

  const [favoriteRoomIds, setFavoriteRoomIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('nubecircle_fav_rooms_v1');
      if (raw) return JSON.parse(raw) as string[];
    } catch {
      // Ignore storage errors
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('nubecircle_fav_rooms_v1', JSON.stringify(favoriteRoomIds));
    } catch {
      // Ignore storage errors
    }
  }, [favoriteRoomIds]);

  // Audio & Music State (4 independent simultaneous channels + chime)
  const [audio, setAudio] = useState<AudioState>({
    track1On: false,
    track1Vol: 0.5,
    track2On: false,
    track2Vol: 0.45,
    rainOn: false,
    rainVol: 0.55,
    breezeOn: false,
    breezeVol: 0.45,
    chimeEnabled: true,
  });

  useEffect(() => {
    soundEngine.setMusicTrack('track1', audio.track1On, audio.track1Vol);
  }, [audio.track1On, audio.track1Vol]);

  useEffect(() => {
    soundEngine.setMusicTrack('track2', audio.track2On, audio.track2Vol);
  }, [audio.track2On, audio.track2Vol]);

  useEffect(() => {
    soundEngine.setChannel('rain', audio.rainOn, audio.rainVol);
  }, [audio.rainOn, audio.rainVol]);

  useEffect(() => {
    soundEngine.setChannel('breeze', audio.breezeOn, audio.breezeVol);
  }, [audio.breezeOn, audio.breezeVol]);

  useEffect(() => {
    return () => {
      soundEngine.stopAll();
    };
  }, []);

  const handleAudioPatch = (patch: Partial<AudioState>) => {
    setAudio((prev) => ({ ...prev, ...patch }));
  };

  // Timer Handlers
  const handleModeChange = (nextMode: TimerMode) => {
    setTimerMode(nextMode);
    const nextSeconds = TIMER_PRESETS[nextMode].minutes * 60;
    setIsRunning(false);
    setJustCelebrated(false);
    setSecondsLeft(nextSeconds);
    setTotalSeconds(nextSeconds);
  };

  const handleCompleteBlock = () => {
    setIsRunning(false);
    setJustCelebrated(true);
    if (audio.chimeEnabled) {
      soundEngine.playChime();
    }

    const preset = TIMER_PRESETS[timerMode];
    if (!preset.isBreak) {
      const earnedMinutes = Math.max(1, Math.round(totalSeconds / 60));
      const todayKey = getTodayKey();

      setProgress((prev) => {
        const nextMinutes = (prev.dateKey === todayKey ? prev.focusedMinutes : 0) + earnedMinutes;
        const nextBlocks = (prev.dateKey === todayKey ? prev.completedBlocks : 0) + 1;
        setHistory((prevHist) => ({
          ...prevHist,
          [todayKey]: { focusedMinutes: nextMinutes, completedBlocks: nextBlocks },
        }));
        return {
          dateKey: todayKey,
          focusedMinutes: nextMinutes,
          completedBlocks: nextBlocks,
          streakDays: Math.max(1, prev.streakDays),
        };
      });

      if (selectedTaskId) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === selectedTaskId ? { ...t, pomodorosDone: t.pomodorosDone + 1 } : t
          )
        );
      }
    }
  };

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
  }, [isRunning, timerMode, selectedTaskId, audio.chimeEnabled, totalSeconds]);

  // Document title shows timer while active
  useEffect(() => {
    if (isRunning) {
      const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
      const secs = String(secondsLeft % 60).padStart(2, '0');
      document.title = `${mins}:${secs} · NubeCircle`;
    } else {
      document.title = 'NubeCircle';
    }
  }, [isRunning, secondsLeft]);

  const handleReset = () => {
    setIsRunning(false);
    setJustCelebrated(false);
    const resetSecs = TIMER_PRESETS[timerMode].minutes * 60;
    setSecondsLeft(resetSecs);
    setTotalSeconds(resetSecs);
  };

  const handleAddFiveMinutes = () => {
    setSecondsLeft((prev) => prev + 300);
    setTotalSeconds((prev) => prev + 300);
    setJustCelebrated(false);
  };

  // Task Handlers
  const handleAddTask = (title: string, subject: string) => {
    const newTask: StudyTask = {
      id: `task-${Date.now()}`,
      title,
      subject,
      completed: false,
      pomodorosDone: 0,
      pomodorosTarget: 2,
    };
    setTasks((prev) => [newTask, ...prev]);
    setSelectedTaskId(newTask.id);
  };

  const handleToggleTaskDone = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (selectedTaskId === id) {
        setSelectedTaskId(filtered[0]?.id ?? null);
      }
      return filtered;
    });
  };

  // Circle Handlers
  const handleJoinCircle = (room: StudyCircleRoom) => {
    setActiveCircle(room);
    setHasJoinedCircle(true);
    try {
      localStorage.setItem('nubecircle_joined_once_v1', '1');
    } catch {
      // Ignore storage errors
    }
    handleModeChange(room.recommendedMode);
    setActiveTab(AppTab.STUDY);
  };

  const handleToggleFavoriteRoom = (roomId: string) => {
    setFavoriteRoomIds((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  const handleCreateCircle = (name: string, subject: string, mode: TimerMode) => {
    const newRoom: StudyCircleRoom = {
      id: `sala-${Date.now()}`,
      name,
      cadenceLabel: mode === TimerMode.DEEP ? 'Bloques 50/10' : 'Bloques 25/5',
      recommendedMode: mode,
      atmosphere: 'Sala creada por ti para estudiar con ritmo propio.',
      companions: [
        {
          id: `host-${Date.now()}`,
          name: 'Tu nube',
          subject,
          mood: CloudMood.FOCUS,
          minutesIn: 0,
        },
      ],
    };

    setRooms((prev) => {
      const next = [newRoom, ...prev];
      try {
        const customOnly = next.filter(
          (r) => !INITIAL_CIRCLE_ROOMS.some((init) => init.id === r.id)
        );
        localStorage.setItem('nubecircle_custom_rooms_v1', JSON.stringify(customOnly));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
    handleJoinCircle(newRoom);
  };

  const pendingTaskCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="h-[100dvh] w-full bg-slate-200/70 dark:bg-slate-950 flex justify-center overflow-hidden">
      {/* Native Mobile App Shell (max-w-480px centered on desktop, full width on mobile) */}
      <div className="relative w-full max-w-[480px] h-[100dvh] bg-[#F8FAFC] dark:bg-slate-900 sm:border-x sm:border-slate-200 dark:sm:border-slate-800 sm:shadow-2xl flex flex-col overflow-hidden">
        {/* Compact Header (hidden in Zen Focus Mode) */}
        {!zenMode && (
          <AppHeader
            streakDays={progress.streakDays}
            isDark={isDark}
            onToggleTheme={() => setIsDark((prev) => !prev)}
            onOpenHelp={() => setHelpOpen(true)}
          />
        )}

        {/* Scrollable Tab Viewport */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden app-scroll">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="min-h-full"
            >
              {activeTab === AppTab.STUDY && (
                <StudyTab
                  mode={timerMode}
                  onModeChange={handleModeChange}
                  secondsLeft={secondsLeft}
                  totalSeconds={totalSeconds}
                  isRunning={isRunning}
                  justCelebrated={justCelebrated}
                  onToggleRun={() => {
                    setJustCelebrated(false);
                    setIsRunning((prev) => !prev);
                  }}
                  onReset={handleReset}
                  onAddFiveMinutes={handleAddFiveMinutes}
                  onCompleteBlock={handleCompleteBlock}
                  tasks={tasks}
                  selectedTaskId={selectedTaskId}
                  onSelectTask={(id) => setSelectedTaskId(id)}
                  onGoToTasks={() => setActiveTab(AppTab.TASKS)}
                  activeCircle={activeCircle}
                  onLeaveCircle={() => setActiveCircle(null)}
                  audio={audio}
                  onOpenAudioSheet={() => setAudioSheetOpen(true)}
                  zenMode={zenMode}
                  onToggleZenMode={() => setZenMode((prev) => !prev)}
                />
              )}

              {activeTab === AppTab.TASKS && (
                <TasksTab
                  tasks={tasks}
                  selectedTaskId={selectedTaskId}
                  onSelectTask={(id) => {
                    setSelectedTaskId(id);
                    setActiveTab(AppTab.STUDY);
                  }}
                  onAddTask={handleAddTask}
                  onToggleTaskDone={handleToggleTaskDone}
                  onDeleteTask={handleDeleteTask}
                />
              )}

              {activeTab === AppTab.CIRCLES && (
                <CirclesTab
                  rooms={rooms}
                  activeCircle={activeCircle}
                  favoriteIds={favoriteRoomIds}
                  onJoinCircle={handleJoinCircle}
                  onLeaveCircle={() => setActiveCircle(null)}
                  onToggleFavorite={handleToggleFavoriteRoom}
                  onCreateCircle={handleCreateCircle}
                />
              )}

              {activeTab === AppTab.PROGRESS && (
                <ProgressTab
                  progress={progress}
                  history={history}
                  hasJoinedCircle={hasJoinedCircle}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Fixed Bottom Navigation Bar (hidden in Zen Focus Mode) */}
        {!zenMode && (
          <BottomNav
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            pendingTaskCount={pendingTaskCount}
            inCircle={Boolean(activeCircle)}
          />
        )}

        {/* Audio & Music Bottom Sheet */}
        <AudioBottomSheet
          open={audioSheetOpen}
          onClose={() => setAudioSheetOpen(false)}
          audio={audio}
          onChange={handleAudioPatch}
        />

        {/* Mini User Guide Modal */}
        <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    </div>
  );
}
