import React, { useState } from 'react';
import { ArrowRight, Cloud } from 'lucide-react';

interface HeroSectionProps {
  onOpenStudio: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenStudio }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <section id="inicio" className="pt-10 pb-16 lg:pt-16 lg:pb-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left column: Value proposition & primary CTA */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 mb-5">
              <span>Directo en la web</span>
              <span aria-hidden="true">·</span>
              <span>Temporizador Pomodoro</span>
              <span aria-hidden="true">·</span>
              <span>Círculos en calma</span>
            </div>

            <h1 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-tight leading-[1.08] text-slate-900 text-balance max-w-xl">
              Estudia con ritmo propio y una nube que te acompaña.
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg">
              Organiza tus bloques de enfoque, lleva el registro de tus materias y comparte
              sesiones tranquilas en línea directamente desde tu navegador, sin distracciones ni
              descargas.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={onOpenStudio}
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              >
                Abrir espacio de estudio
              </button>

              <a
                href="#circulos"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-sky-700 transition-colors py-2 px-1 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-md"
              >
                <span>Ver círculos de estudio</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-500">
              <div>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">25 / 50 min</span>{' '}
                <span>Bloques flexibles</span>
              </div>
              <div>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">100% web</span>{' '}
                <span>Guardado local automático</span>
              </div>
            </div>
          </div>

          {/* Right column: Cozy cloud desk editorial illustration */}
          <div className="lg:col-span-6 flex">
            <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-[#EFF6FF] shadow-sm min-h-[300px] lg:min-h-[420px]">
              {!imgError ? (
                <img
                  src="/src/assets/images/cloud_hero_desk_1794858937579.jpg"
                  alt="Ilustración de una nube tierna con gafas redondas estudiando frente a un cuaderno abierto y una taza tibia en un escritorio de madera"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover lg:h-full"
                />
              ) : (
                <div className="w-full h-full min-h-[320px] flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-sky-50 to-slate-100">
                  <Cloud className="w-16 h-16 text-sky-500 mb-3" />
                  <p className="font-display font-semibold text-slate-800">
                    Tu compañera nube lista para estudiar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
