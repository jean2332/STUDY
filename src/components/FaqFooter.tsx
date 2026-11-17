import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: '¿Necesito descargar alguna aplicación o crear una cuenta?',
    answer:
      'No. Por ahora NubeCircle funciona al 100% directamente en tu página web. Tus tareas, bloques completados y minutos de hoy se guardan automáticamente en tu navegador.',
  },
  {
    question: '¿Cómo funciona el temporizador y el estado de la nube?',
    answer:
      'Puedes elegir sesiones de 25 o 50 minutos de enfoque y pausas de 5 o 15 minutos. Mientras el reloj avanza, tu nube se pone sus gafas de estudio; al llegar a la pausa, descansa contigo.',
  },
  {
    question: '¿Los sonidos ambientales consumen datos o requieren conexión externa?',
    answer:
      'No. Tanto la lluvia suave como la brisa tranquila y la campana final se generan en tiempo real dentro de tu navegador mediante Web Audio, sin cargar archivos pesados.',
  },
  {
    question: '¿Qué son los círculos de estudio?',
    answer:
      'Son salas virtuales por ritmo de trabajo donde puedes sentar a tu nube junto a otras, sincronizar la duración del temporizador y compartir enlaces de invitación para estudiar a la par.',
  },
];

export const FaqFooter: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <section id="preguntas" className="py-16 lg:py-24 border-t border-slate-200/80 bg-white">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="mb-10">
            <p className="text-xs font-medium text-slate-500 mb-2">Preguntas frecuentes</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Todo lo que necesitas saber antes de tu primer bloque.
            </h2>
          </div>

          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {FAQS.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={item.question}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full py-5 flex items-center justify-between gap-4 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-md"
                  >
                    <span className="font-display text-base sm:text-lg font-semibold text-slate-900">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-sky-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="pb-5 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                      {item.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-[#F8FAFC] py-10">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <a href="#inicio" className="font-display text-lg font-bold tracking-tight text-slate-900">
              NubeCircle
            </a>
            <p className="mt-1 text-xs text-slate-500">
              Espacio web de estudio en calma · Versión web 2026
            </p>
          </div>

          <nav aria-label="Enlaces del pie de página" className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
            <a href="#estudio" className="hover:text-slate-900 transition-colors">
              Estudio
            </a>
            <a href="#circulos" className="hover:text-slate-900 transition-colors">
              Círculos
            </a>
            <a href="#como-funciona" className="hover:text-slate-900 transition-colors">
              Cómo funciona
            </a>
            <a href="#preguntas" className="hover:text-slate-900 transition-colors">
              Preguntas
            </a>
          </nav>
        </div>
      </footer>
    </>
  );
};
