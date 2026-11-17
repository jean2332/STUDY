import React, { useState } from 'react';
import { Check, Cloud, Heart, Link2, Plus, Users } from 'lucide-react';
import { CloudMood, StudyCircleRoom, TimerMode } from '../types/study';
import { CloudMascot } from './CloudMascot';

const INITIAL_ROOMS: StudyCircleRoom[] = [
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

interface StudyCirclesProps {
  activeCircle: StudyCircleRoom | null;
  onJoinCircle: (room: StudyCircleRoom) => void;
}

export const StudyCircles: React.FC<StudyCirclesProps> = ({ activeCircle, onJoinCircle }) => {
  const [rooms, setRooms] = useState<StudyCircleRoom[]>(INITIAL_ROOMS);
  const [imgError, setImgError] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cheeredId, setCheeredId] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCopyInvite = (room: StudyCircleRoom) => {
    const shareUrl = `${window.location.origin}/#circulos?sala=${encodeURIComponent(room.id)}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    setCopiedId(room.id);
    window.setTimeout(() => setCopiedId(null), 2200);
  };

  const handleSendCheer = (roomId: string) => {
    setCheeredId(roomId);
    window.setTimeout(() => setCheeredId(null), 2200);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customName.trim();
    if (!trimmed) return;

    const newRoom: StudyCircleRoom = {
      id: `sala-${Date.now()}`,
      name: trimmed,
      cadenceLabel: 'Bloques 25/5',
      recommendedMode: TimerMode.FOCUS,
      atmosphere: 'Sala creada por ti para estudiar con ritmo propio.',
      companions: [
        {
          id: `host-${Date.now()}`,
          name: 'Tu nube',
          subject: customSubject.trim() || 'Sesión libre',
          mood: CloudMood.FOCUS,
          minutesIn: 0,
        },
      ],
    };

    setRooms((prev) => [newRoom, ...prev]);
    onJoinCircle(newRoom);
    setCustomName('');
    setCustomSubject('');
    setShowCreateForm(false);
  };

  return (
    <section id="circulos" className="py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header & 16:9 Editorial Illustration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium text-slate-500 mb-2">Círculos virtuales</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Estudia acompañado en salas tranquilas por ritmo de enfoque.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              Inspirado en la dinámica de círculos de estudio: elige una mesa según la duración de
              tus bloques, sienta a tu nube con el grupo o abre tu propia sala para compartir el
              enlace desde el navegador.
            </p>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowCreateForm((prev) => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <Plus className="w-4 h-4 text-sky-600" />
                <span>{showCreateForm ? 'Cerrar formulario' : 'Crear mi propio círculo'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-sky-50">
              {!imgError ? (
                <img
                  src="/src/assets/images/cloud_circle_group_1794858937773.jpg"
                  alt="Cuatro nubes tiernas con caras felices estudiando juntas alrededor de una mesa redonda con libros y lámparas cálidas"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                  <Cloud className="w-12 h-12 text-sky-500 mb-3" />
                  <p className="text-sm font-medium text-slate-700">Mesa compartida de estudio</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Optional create circle inline panel */}
        {showCreateForm && (
          <form
            onSubmit={handleCreateRoom}
            className="mb-10 bg-white border border-slate-200 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end"
          >
            <div className="sm:col-span-5">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Nombre del círculo
              </label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Ej. Repaso de arquitectura"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Materia principal
              </label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Ej. Diseño estructural"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors cursor-pointer"
              >
                Abrir círculo
              </button>
            </div>
          </form>
        )}

        {/* Study Circle Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const isJoined = activeCircle?.id === room.id;
            const alreadySeated = room.companions.some((c) => c.name === 'Tu nube');
            const displayCount =
              isJoined && !alreadySeated ? room.companions.length + 1 : room.companions.length;

            return (
              <article
                key={room.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between transition-colors ${
                  isJoined
                    ? 'bg-white border-sky-500 shadow-sm'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  {/* Unboxed quiet metadata */}
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                    <span>{room.cadenceLabel}</span>
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <Users className="w-3.5 h-3.5" />
                      {displayCount}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-semibold text-slate-900">
                    {room.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                    {room.atmosphere}
                  </p>

                  {/* Cloud Companions around the circle */}
                  <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                    {room.companions.map((companion) => (
                      <div key={companion.id} className="flex items-center gap-2 min-w-0">
                        <div className="shrink-0">
                          <CloudMascot mood={companion.mood} size="sm" label={companion.name} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {companion.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {companion.subject}
                          </p>
                        </div>
                      </div>
                    ))}

                    {isJoined && !room.companions.some((c) => c.name === 'Tu nube') && (
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="shrink-0">
                          <CloudMascot mood={CloudMood.FOCUS} size="sm" label="Tu nube" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-sky-700 truncate">Tu nube</p>
                          <p className="text-[11px] text-slate-500 truncate">En la mesa</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onJoinCircle(room)}
                    className={`flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                      isJoined
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : 'bg-sky-600 text-white hover:bg-sky-700'
                    }`}
                  >
                    {isJoined ? 'Sentado en el círculo' : 'Unirse al círculo'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendCheer(room.id)}
                    aria-label={`Enviar ánimo a ${room.name}`}
                    className="p-2.5 text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="Enviar ánimo"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        cheeredId === room.id ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyInvite(room)}
                    aria-label={`Copiar enlace de ${room.name}`}
                    className="p-2.5 text-slate-600 hover:text-sky-700 bg-slate-50 hover:bg-sky-50 border border-slate-200 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="Copiar enlace de invitación"
                  >
                    {copiedId === room.id ? (
                      <Check className="w-4 h-4 text-sky-600" />
                    ) : (
                      <Link2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
