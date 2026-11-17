import React, { useMemo } from 'react';
import { Award, CheckCircle2, Flame, Lock, Sparkles, Users } from 'lucide-react';
import { CloudMood, DailyProgress, WeeklyHistoryRecord } from '../types/study';
import { CloudMascot } from './CloudMascot';

interface ProgressTabProps {
  progress: DailyProgress;
  history: WeeklyHistoryRecord;
  hasJoinedCircle: boolean;
}

const DAY_NAMES = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({
  progress,
  history,
  hasJoinedCircle,
}) => {
  const last7Days = useMemo(() => {
    const days: Array<{ key: string; label: string; minutes: number; isToday: boolean }> = [];
    const today = new Date();
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(today);
      d.setDate(today.getDate() - offset);
      const key = formatDateKey(d);
      const mins =
        offset === 0
          ? progress.focusedMinutes
          : history[key]?.focusedMinutes ?? 0;
      days.push({
        key,
        label: DAY_NAMES[d.getDay()],
        minutes: mins,
        isToday: offset === 0,
      });
    }
    return days;
  }, [history, progress.focusedMinutes]);

  const maxDayMinutes = Math.max(30, ...last7Days.map((d) => d.minutes));
  const totalWeekMinutes = last7Days.reduce((acc, d) => acc + d.minutes, 0);

  const totalHistoricalMinutes = useMemo(() => {
    const pastSum = Object.entries(history).reduce((acc, [key, val]) => {
      if (key === progress.dateKey) return acc;
      return acc + (val.focusedMinutes || 0);
    }, 0);
    return pastSum + progress.focusedMinutes;
  }, [history, progress.dateKey, progress.focusedMinutes]);

  // Unlockable Cloud Mascot Level
  const levelInfo = useMemo(() => {
    if (totalHistoricalMinutes >= 420) {
      return {
        level: 4,
        title: 'Nube Sabia',
        mood: CloudMood.CELEBRATE,
        nextTarget: 600,
        prevTarget: 420,
      };
    }
    if (totalHistoricalMinutes >= 180) {
      return {
        level: 3,
        title: 'Nube Serena',
        mood: CloudMood.FOCUS,
        nextTarget: 420,
        prevTarget: 180,
      };
    }
    if (totalHistoricalMinutes >= 60) {
      return {
        level: 2,
        title: 'Nube Enfocada',
        mood: CloudMood.FOCUS,
        nextTarget: 180,
        prevTarget: 60,
      };
    }
    return {
      level: 1,
      title: 'Nube Curiosa',
      mood: CloudMood.IDLE,
      nextTarget: 60,
      prevTarget: 0,
    };
  }, [totalHistoricalMinutes]);

  const levelPct = Math.min(
    100,
    Math.round(
      ((totalHistoricalMinutes - levelInfo.prevTarget) /
        Math.max(1, levelInfo.nextTarget - levelInfo.prevTarget)) *
        100
    )
  );

  const badges = [
    {
      id: 'first-block',
      title: 'Primer paso',
      requirement: 'Completa 1 bloque hoy',
      unlocked: progress.completedBlocks >= 1 || totalHistoricalMinutes >= 25,
      Icon: CheckCircle2,
    },
    {
      id: 'hour-focus',
      title: 'Una hora en calma',
      requirement: 'Suma 60 min totales',
      unlocked: totalHistoricalMinutes >= 60,
      Icon: Award,
    },
    {
      id: 'streak-3',
      title: 'Racha constante',
      requirement: 'Mantén 3 días de racha',
      unlocked: progress.streakDays >= 3,
      Icon: Flame,
    },
    {
      id: 'circle-friend',
      title: 'Estudio en compañía',
      requirement: 'Únete a un círculo',
      unlocked: hasJoinedCircle,
      Icon: Users,
    },
  ];

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Today's Metrics Card */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
            Resumen de hoy
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Guardado local</span>
        </div>

        <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-700">
          <div className="pr-3">
            <div className="font-mono text-2xl font-semibold text-slate-900 dark:text-slate-50 tabular-nums">
              {progress.focusedMinutes}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Minutos</div>
          </div>
          <div className="px-3">
            <div className="font-mono text-2xl font-semibold text-slate-900 dark:text-slate-50 tabular-nums">
              {progress.completedBlocks}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Bloques</div>
          </div>
          <div className="pl-3">
            <div className="font-mono text-2xl font-semibold text-slate-900 dark:text-slate-50 tabular-nums">
              {progress.streakDays} d
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Racha</div>
          </div>
        </div>
      </div>

      {/* 7-Day Bar Chart */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5">
        <div className="flex items-baseline justify-between gap-2 mb-5">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
              Últimos 7 días
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Minutos de enfoque diario
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
            {totalWeekMinutes} min total
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 items-end h-36 pt-4">
          {last7Days.map((day) => {
            const heightPct = day.minutes > 0 ? Math.max(10, Math.round((day.minutes / maxDayMinutes) * 100)) : 4;
            return (
              <div key={day.key} className="flex flex-col items-center h-full justify-end gap-1.5">
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">
                  {day.minutes > 0 ? day.minutes : ''}
                </span>
                <div className="w-full flex-1 flex items-end justify-center">
                  <div
                    role="img"
                    aria-label={`${day.label}: ${day.minutes} minutos`}
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[26px] rounded-t-lg transition-all duration-300 ${
                      day.isToday
                        ? 'bg-sky-600 dark:bg-sky-500'
                        : day.minutes > 0
                          ? 'bg-sky-200 dark:bg-sky-800'
                          : 'bg-slate-200 dark:bg-slate-700/60'
                    }`}
                  />
                </div>
                <span
                  className={`text-[11px] font-semibold ${
                    day.isToday
                      ? 'text-sky-600 dark:text-sky-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cloud Mascot Level & Unlockable Medals */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <CloudMascot mood={levelInfo.mood} size="sm" label={levelInfo.title} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-mono tabular-nums">Nivel {levelInfo.level}</span>
            </div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
              {levelInfo.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {totalHistoricalMinutes} / {levelInfo.nextTarget} min acumulados
            </p>
          </div>
        </div>

        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div
            style={{ width: `${levelPct}%` }}
            className="h-full bg-sky-600 dark:bg-sky-500 rounded-full transition-all duration-300"
          />
        </div>

        {/* Unlockable Badges Grid */}
        <div className="pt-2 grid grid-cols-2 gap-2.5">
          {badges.map(({ id, title, requirement, unlocked, Icon }) => (
            <div
              key={id}
              className={`p-3 rounded-2xl border flex items-start gap-2.5 ${
                unlocked
                  ? 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800'
                  : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 opacity-75'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  unlocked
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {unlocked ? <Icon className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                  {title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {requirement}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
