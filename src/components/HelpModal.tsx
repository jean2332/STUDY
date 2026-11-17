import React from 'react';
import { BottomSheet } from './BottomSheet';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const GUIDE_ITEMS = [
  {
    step: '01.',
    title: 'Temporizador y Modo Zen',
    text: 'Elige entre bloques de 25 o 50 minutos y pausas de 5 o 15 minutos. Activa el Modo Zen para ocultar las barras superior e inferior mientras estudias.',
  },
  {
    step: '02.',
    title: 'Tu compañera nube',
    text: 'Nubecita se pone sus gafas al iniciar el reloj y descansa contigo con té en las pausas. Toca la nube en cualquier momento para recibir ánimo.',
  },
  {
    step: '03.',
    title: 'Música Lo-Fi y sonidos',
    text: 'Desde la tarjeta Audio y Música puedes combinar pistas musicales en bucle con lluvia suave o brisa tranquila, ajustando cada volumen por separado.',
  },
  {
    step: '04.',
    title: 'Tareas, Círculos y Progreso',
    text: 'Organiza tus materias en Tareas, únete o crea salas en Círculos, y revisa tu historial semanal y medallas en Progreso. Todo se guarda en tu dispositivo.',
  },
];

export const HelpModal: React.FC<HelpModalProps> = ({ open, onClose }) => {
  return (
    <BottomSheet open={open} onClose={onClose} title="Cómo funciona NubeCircle">
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Espacio móvil diseñado para estudiar con ritmo propio, sin distracciones ni descargas
          adicionales.
        </p>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800">
          {GUIDE_ITEMS.map((item) => (
            <div key={item.step} className="py-3.5 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xs font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
                  {item.step}
                </span>
                <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {item.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[48px] px-4 py-3 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-2xl transition-colors cursor-pointer"
        >
          Entendido, volver al estudio
        </button>
      </div>
    </BottomSheet>
  );
};
