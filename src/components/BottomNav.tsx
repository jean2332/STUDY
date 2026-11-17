import React from 'react';
import { BarChart3, CheckSquare, Clock, Users } from 'lucide-react';
import { AppTab } from '../types/study';

interface BottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  pendingTaskCount: number;
  inCircle: boolean;
}

const NAV_ITEMS: Array<{
  tab: AppTab;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { tab: AppTab.STUDY, label: 'Estudio', Icon: Clock },
  { tab: AppTab.TASKS, label: 'Tareas', Icon: CheckSquare },
  { tab: AppTab.CIRCLES, label: 'Círculos', Icon: Users },
  { tab: AppTab.PROGRESS, label: 'Progreso', Icon: BarChart3 },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  pendingTaskCount,
  inCircle,
}) => {
  return (
    <nav
      aria-label="Navegación principal de la aplicación"
      className="shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe z-30"
    >
      <div className="grid grid-cols-4 h-[60px] px-1">
        {NAV_ITEMS.map(({ tab, label, Icon }) => {
          const isActive = activeTab === tab;
          const showCount = tab === AppTab.TASKS && pendingTaskCount > 0;
          const showCircleMark = tab === AppTab.CIRCLES && inCircle;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onSelectTab(tab)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                isActive
                  ? 'text-sky-600 dark:text-sky-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-[22px] h-[22px] ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
                {showCount && (
                  <span className="sr-only">({pendingTaskCount} pendientes)</span>
                )}
                {showCircleMark && (
                  <span className="sr-only">(En círculo activo)</span>
                )}
              </div>
              <span className={`text-[11px] leading-none tracking-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 w-5 h-0.5 rounded-full bg-sky-600 dark:bg-sky-400"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
