import React from 'react';
import { HelpCircle, Moon, Sun } from 'lucide-react';

interface AppHeaderProps {
  streakDays: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenHelp: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  streakDays,
  isDark,
  onToggleTheme,
  onOpenHelp,
}) => {
  return (
    <header className="shrink-0 pt-safe bg-[#F8FAFC]/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 z-30">
      <div className="h-[52px] px-4 flex items-center justify-between gap-2">
        {/* Left: NubeCircle brand wordmark */}
        <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 whitespace-nowrap shrink-0">
          NubeCircle
        </span>

        {/* Right: Active streak + Theme toggle + Help button */}
        <div className="flex items-center gap-1 shrink-0">
          <div
            aria-label={`Racha activa de ${streakDays} días`}
            className="inline-flex items-center gap-1 px-2.5 h-[36px] text-xs font-semibold text-slate-700 dark:text-slate-200 font-mono tabular-nums whitespace-nowrap"
          >
            <span aria-hidden="true">🔥</span>
            <span>{streakDays} d</span>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={onOpenHelp}
            aria-label="Abrir mini guía de uso"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
