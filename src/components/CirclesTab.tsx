import React, { useState } from 'react';
import { Check, Heart, Link2, Plus, Users } from 'lucide-react';
import { CloudMood, StudyCircleRoom, TimerMode } from '../types/study';
import { CloudMascot } from './CloudMascot';
import { BottomSheet } from './BottomSheet';

export const INITIAL_CIRCLE_ROOMS: StudyCircleRoom[] = [
  {
    id: 'sala-manana',
    name: 'Sala Silenciosa de Mañana',
    cadenceLabel: 'Bloques 25/5',
    recommendedMode: TimerMode.FOCUS,
    atmosphere: 'Lectura pausada, apuntes y ejercicios individuales.',
    companions: [
      { id: 'c1', name: 'Sofía', subject: 'Cálculo II', mood: CloudMood.FOCUS, minutesIn: 18 },
      { id: 'c2', name: 'Mateo', subject: 'Anatomía', mood: CloudMood.FOCUS, minutesIn: 14 },
      { id: 'c3', name: 'Lucía', subject: 'Inglés B2', mood: CloudMood.IDLE, minutesIn: 22 },
    ],
  },
  {
    id: 'maraton-profundo',
    name: 'Círculo de Enfoque Profundo',
    cadenceLabel: 'Bloques 50/10',
    recommendedMode: TimerMode.DEEP,
    atmosphere: 'Sesiones largas para proyectos, código y redacción.',
    companions: [
      { id: 'c4', name: 'Diego', subject: 'Algoritmos', mood: CloudMood.FOCUS, minutesIn: 37 },
      { id: 'c5', name: 'Valeria', subject: 'Tesis', mood: CloudMood.FOCUS, minutesIn: 41 },
      { id: 'c6', name: 'Elena', subject: 'Historia', mood: CloudMood.BREAK, minutesIn: 5 },
    ],
  },
  {
    id: 'repaso-tarde',
    name: 'Mesa de Repaso y Té',
    cadenceLabel: 'Bloques 25/5',
    recommendedMode: TimerMode.FOCUS,
    atmosphere: 'Ideal para tarjetas de memoria y repaso ligero.',
    companions: [
      { id: 'c7', name: 'Camila', subject: 'Biología', mood: CloudMood.FOCUS, minutesIn: 12 },
      { id: 'c8', name: 'Tomás', subject: 'Química', mood: CloudMood.CELEBRATE, minutesIn: 25 },
    ],
  },
];

interface CirclesTabProps {
  rooms: StudyCircleRoom[];
  activeCircle: StudyCircleRoom | null;
  favoriteIds: string[];
  onJoinCircle: (room: StudyCircleRoom) => void;
  onLeaveCircle: () => void;
  onToggleFavorite: (roomId: string) => void;
  onCreateCircle: (name: string, subject: string, mode: TimerMode) => void;
}

export const CirclesTab: React.FC<CirclesTabProps> = ({
  rooms,
  activeCircle,
  favoriteIds,
  onJoinCircle,
  onLeaveCircle,
  onToggleFavorite,
  onCreateCircle,
}) => {
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customMode, setCustomMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyInvite = (room: StudyCircleRoom) => {
    const shareUrl = `${window.location.origin}/?sala=${encodeURIComponent(room.id)}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    setCopiedId(room.id);
    window.setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customName.trim();
    if (!trimmed) return;
    onCreateCircle(trimmed, customSubject.trim() || 'Sesión libre', customMode);
    setCustomName('');
    setCustomSubject('');
    setCustomMode(TimerMode.FOCUS);
    setCreateSheetOpen(false);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Top Badge when joined */}
      {activeCircle && (
        <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-sky-700 dark:text-sky-300">
              Círculo activo
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {activeCircle.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onLeaveCircle}
            className="min-h-[44px] px-3 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100/70 dark:hover:bg-sky-900/50 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            Salir
          </button>
        </div>
      )}

      {/* Header + Create Circle Action */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">
            Círculos de estudio
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Salas en una columna para estudiar acompañado
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateSheetOpen(true)}
          className="min-h-[44px] px-3.5 py-2 flex items-center gap-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-2xl shrink-0 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Crear</span>
        </button>
      </div>

      {/* Single-Column Room Cards */}
      <div className="space-y-3">
        {rooms.map((room) => {
          const isJoined = activeCircle?.id === room.id;
          const isFavorite = favoriteIds.includes(room.id);
          const alreadySeated = room.companions.some((c) => c.name === 'Tu nube');
          const displayCount =
            isJoined && !alreadySeated ? room.companions.length + 1 : room.companions.length;

          return (
            <article
              key={room.id}
              className={`rounded-3xl border p-4 space-y-3.5 transition-colors ${
                isJoined
                  ? 'bg-white dark:bg-slate-800/80 border-sky-500 shadow-xs'
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{room.cadenceLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <Users className="w-3.5 h-3.5" />
                      {displayCount}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100 mt-1">
                    {room.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {room.atmosphere}
                  </p>
                </div>
              </div>

              {/* Cloud Companions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/70 grid grid-cols-2 gap-2.5">
                {room.companions.map((companion) => (
                  <div key={companion.id} className="flex items-center gap-2 min-w-0">
                    <div className="shrink-0">
                      <CloudMascot mood={companion.mood} size="sm" label={companion.name} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {companion.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {companion.subject}
                      </p>
                    </div>
                  </div>
                ))}

                {isJoined && !alreadySeated && (
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="shrink-0">
                      <CloudMascot mood={CloudMood.FOCUS} size="sm" label="Tu nube" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 truncate">
                        Tu nube
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        En la mesa
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Touch Actions */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => (isJoined ? onLeaveCircle() : onJoinCircle(room))}
                  className={`flex-1 min-h-[44px] px-4 py-2 text-xs font-semibold rounded-2xl transition-colors cursor-pointer ${
                    isJoined
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                      : 'bg-sky-600 hover:bg-sky-700 text-white'
                  }`}
                >
                  {isJoined ? 'Salir del círculo' : 'Unirse al círculo'}
                </button>

                <button
                  type="button"
                  onClick={() => onToggleFavorite(room.id)}
                  aria-label={isFavorite ? `Quitar favorito ${room.name}` : `Marcar favorito ${room.name}`}
                  aria-pressed={isFavorite}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                >
                  <Heart
                    className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyInvite(room)}
                  aria-label={`Copiar enlace de ${room.name}`}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer shrink-0"
                >
                  {copiedId === room.id ? (
                    <Check className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  ) : (
                    <Link2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Create Circle Bottom Sheet */}
      <BottomSheet
        open={createSheetOpen}
        onClose={() => setCreateSheetOpen(false)}
        title="Crear nuevo círculo"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pb-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Nombre de la sala
            </label>
            <input
              type="text"
              required
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Ej. Repaso de arquitectura"
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Materia principal
            </label>
            <input
              type="text"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              placeholder="Ej. Diseño estructural"
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Ritmo de estudio
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCustomMode(TimerMode.FOCUS)}
                className={`min-h-[44px] px-3 py-2 text-xs font-semibold rounded-xl border cursor-pointer ${
                  customMode === TimerMode.FOCUS
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Bloques 25/5
              </button>
              <button
                type="button"
                onClick={() => setCustomMode(TimerMode.DEEP)}
                className={`min-h-[44px] px-3 py-2 text-xs font-semibold rounded-xl border cursor-pointer ${
                  customMode === TimerMode.DEEP
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Bloques 50/10
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] px-4 py-3 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-2xl transition-colors cursor-pointer"
          >
            Abrir y sentarme en el círculo
          </button>
        </form>
      </BottomSheet>
    </div>
  );
};
