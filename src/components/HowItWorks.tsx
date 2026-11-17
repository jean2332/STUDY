import React, { useState } from 'react';
import { Cloud } from 'lucide-react';

const STEPS = [
  {
    number: '01.',
    title: 'Elige tu bloque de enfoque',
    description:
      'Selecciona sesiones clásicas de 25 minutos o bloques profundos de 50 minutos. El temporizador ajusta pausas cortas y largas para cuidar tu descanso.',
  },
  {
    number: '02.',
    title: 'Acompáñate de tu nube',
    description:
      'Tu nube se pone sus gafas cuando inicias el reloj, descansa contigo con una taza tibia en las pausas y celebra cada meta completada.',
  },
  {
    number: '03.',
    title: 'Ordena tus materias',
    description:
      'Anota tus temas pendientes por asignatura, marca en qué estás trabajando ahora y observa cómo suman tus minutos reales de estudio.',
  },
  {
    number: '04.',
    title: 'Estudia en círculos tranquilos',
    description:
      'Únete a una sala temática según tu ritmo de trabajo para mantener la constancia acompañado de otras nubes en silencio.',
  },
];

export const HowItWorks: React.FC = () => {
  const [imgError, setImgError] = useState(false);

  return (
    <section id="como-funciona" className="py-16 lg:py-24 border-t border-slate-200/80">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          {/* Editorial illustration */}
          <div className="lg:col-span-5 flex">
            <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[280px]">
              {!imgError ? (
                <img
                  src="/src/assets/images/cloud_break_tea_1794858937728.jpg"
                  alt="Nube tierna descansando con ojos cerrados felices junto a una taza de té humeante y una pequeña planta"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover lg:h-full"
                />
              ) : (
                <div className="w-full h-full min-h-[280px] flex flex-col items-center justify-center p-8 text-center bg-sky-50">
                  <Cloud className="w-12 h-12 text-sky-500 mb-3" />
                  <p className="text-sm font-medium text-slate-700">Descansos conscientes entre bloques</p>
                </div>
              )}
            </div>
          </div>

          {/* Numbered editorial steps */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <p className="text-xs font-medium text-slate-500 mb-2">Método sencillo</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Diseñado para estudiar sin ruido visual ni presiones innecesarias.
            </h2>

            <div className="mt-8 divide-y divide-slate-200">
              {STEPS.map((step) => (
                <div key={step.number} className="py-5 first:pt-0 last:pb-0 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4">
                  <div className="sm:col-span-5 flex items-baseline gap-2.5">
                    <span className="font-mono text-sm font-semibold text-sky-600 tabular-nums">
                      {step.number}
                    </span>
                    <h3 className="font-display text-base font-semibold text-slate-900">
                      {step.title}
                    </h3>
                  </div>
                  <p className="sm:col-span-7 text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
