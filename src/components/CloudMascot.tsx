import React, { useEffect, useState } from 'react';
import { CloudMood } from '../types/study';

interface CloudMascotProps {
  mood: CloudMood;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onPet?: () => void;
  speechText?: string | null;
  label?: string;
}

export const CloudMascot: React.FC<CloudMascotProps> = ({
  mood,
  size = 'lg',
  interactive = false,
  onPet,
  speechText = null,
  label = 'Nubecita compañera de estudio',
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);

  // Gentle periodic eye blink when eyes are open
  useEffect(() => {
    if (mood === CloudMood.BREAK || mood === CloudMood.CELEBRATE) {
      return;
    }
    const interval = setInterval(() => {
      setIsBlinking(true);
      const timeout = setTimeout(() => setIsBlinking(false), 160);
      return () => clearTimeout(timeout);
    }, 4200);
    return () => clearInterval(interval);
  }, [mood]);

  const handleClick = () => {
    if (!interactive) return;
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 450);
    onPet?.();
  };

  const dimensions =
    size === 'sm'
      ? 'w-14 h-12'
      : size === 'md'
        ? 'w-32 h-28'
        : 'w-48 h-40 sm:w-52 sm:h-44';

  const effectiveMood = isWiggling ? CloudMood.BLUSH : mood;
  const isClosedEyes =
    isBlinking ||
    effectiveMood === CloudMood.BREAK ||
    effectiveMood === CloudMood.CELEBRATE ||
    effectiveMood === CloudMood.BLUSH;

  const Wrapper = interactive ? 'button' : 'div';

  return (
    <div className="relative inline-flex flex-col items-center select-none">
      {speechText && (
        <div
          role="status"
          aria-live="polite"
          className="mb-2 px-3 py-1 bg-white border border-slate-200 rounded-xl shadow-xs text-xs font-medium text-slate-700 whitespace-nowrap transition-opacity duration-200"
        >
          {speechText}
        </div>
      )}

      <Wrapper
        {...(interactive
          ? {
              type: 'button' as const,
              onClick: handleClick,
              'aria-label': `${label}. Toca para animar a tu nube`,
            }
          : { 'aria-label': label })}
        className={`relative inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 rounded-3xl ${
          interactive ? 'cursor-pointer transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97]' : ''
        }`}
      >
        <svg
          viewBox="0 0 220 175"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${dimensions} ${size !== 'sm' ? 'animate-cloud-float' : ''} transition-transform duration-300 ${
            isWiggling ? '-rotate-3 scale-105' : ''
          }`}
        >
          {/* Soft ground shadow */}
          <ellipse cx="110" cy="156" rx="64" ry="8" fill="#E2E8F0" opacity="0.65" />

          {/* Celebration stars */}
          {effectiveMood === CloudMood.CELEBRATE && (
            <g fill="#38BDF8">
              <path d="M36 44L39 36L42 44L50 47L42 50L39 58L36 50L28 47L36 44Z" opacity="0.85" />
              <path d="M180 34L182.5 27L185 34L192 36.5L185 39L182.5 46L180 39L173 36.5L180 34Z" opacity="0.9" />
              <circle cx="58" cy="24" r="3" fill="#FBBF24" />
              <circle cx="164" cy="22" r="2.5" fill="#FB7185" />
            </g>
          )}

          {/* Fluffy cloud silhouette */}
          <g>
            <path
              d="M58 138H162C182.987 138 200 120.987 200 100C200 81.404 186.634 65.928 168.985 62.665C165.437 36.854 143.309 17 116.5 17C93.86 17 74.544 31.158 66.892 51.101C64.027 50.382 61.028 50 57.939 50C37.538 50 21 66.538 21 86.939C21 90.478 21.498 93.901 22.429 97.143C20.237 101.663 19 106.737 19 112.1C19 126.404 30.596 138 44.9 138H58Z"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Soft inner sky-tint underbelly */}
            <path
              d="M44 134H162C178 134 191 122 193 107C186 119 172 126 156 126H52C37 126 26 118 23 107C25 122 33 134 44 134Z"
              fill="#EFF6FF"
            />
          </g>

          {/* Little tucked cloud arms */}
          <path
            d="M74 114C66 114 62 121 68 126C73 130 82 126 83 120"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M146 114C154 114 158 121 152 126C147 130 138 126 137 120"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Rosy cheeks */}
          <ellipse
            cx="76"
            cy="96"
            rx={effectiveMood === CloudMood.BLUSH ? 11 : 8.5}
            ry={effectiveMood === CloudMood.BLUSH ? 6.5 : 5}
            fill="#FB7185"
            opacity={effectiveMood === CloudMood.BLUSH ? 0.55 : 0.35}
          />
          <ellipse
            cx="144"
            cy="96"
            rx={effectiveMood === CloudMood.BLUSH ? 11 : 8.5}
            ry={effectiveMood === CloudMood.BLUSH ? 6.5 : 5}
            fill="#FB7185"
            opacity={effectiveMood === CloudMood.BLUSH ? 0.55 : 0.35}
          />

          {/* Eyes */}
          {isClosedEyes ? (
            <g stroke="#1E293B" strokeWidth="3" strokeLinecap="round">
              {effectiveMood === CloudMood.BREAK ? (
                <>
                  {/* Peaceful resting arcs */}
                  <path d="M77 83C80 87 86 87 89 83" />
                  <path d="M131 83C134 87 140 87 143 83" />
                </>
              ) : (
                <>
                  {/* Happy ^ ^ eyes */}
                  <path d="M77 86C80 80 86 80 89 86" />
                  <path d="M131 86C134 80 140 80 143 86" />
                </>
              )}
            </g>
          ) : (
            <g>
              {/* Left eye */}
              <circle cx="83" cy="83" r="5.5" fill="#1E293B" />
              <circle cx="81" cy="81" r="1.9" fill="#FFFFFF" />
              {/* Right eye */}
              <circle cx="137" cy="83" r="5.5" fill="#1E293B" />
              <circle cx="135" cy="81" r="1.9" fill="#FFFFFF" />
            </g>
          )}

          {/* Round study glasses in FOCUS mode */}
          {effectiveMood === CloudMood.FOCUS && (
            <g stroke="#334155" strokeWidth="2.2" fill="none">
              <circle cx="83" cy="83" r="13.5" fill="#EFF6FF" fillOpacity="0.22" />
              <circle cx="137" cy="83" r="13.5" fill="#EFF6FF" fillOpacity="0.22" />
              <path d="M96.5 82C105 79 115 79 123.5 82" strokeLinecap="round" />
              <path d="M69.5 81L60 78" strokeLinecap="round" />
              <path d="M150.5 81L160 78" strokeLinecap="round" />
            </g>
          )}

          {/* Cute little mouth */}
          {effectiveMood === CloudMood.CELEBRATE ? (
            <path
              d="M101 94C103 102 117 102 119 94Z"
              fill="#FB7185"
              stroke="#1E293B"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M102 95C105.5 99.5 114.5 99.5 118 95"
              stroke="#1E293B"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          )}

          {/* Steaming teacup prop in BREAK mode */}
          {effectiveMood === CloudMood.BREAK && size !== 'sm' && (
            <g transform="translate(154, 114)">
              <path
                d="M4 12C4 12 2 6 6 2"
                stroke="#94A3B8"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="animate-steam"
              />
              <path
                d="M12 12C12 12 10 5 14 1"
                stroke="#94A3B8"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="animate-steam"
              />
              <rect x="0" y="16" width="22" height="18" rx="6" fill="#FFFFFF" stroke="#64748B" strokeWidth="2" />
              <path d="M22 20H25C27.2 20 29 21.8 29 24C29 26.2 27.2 28 25 28H22" stroke="#64748B" strokeWidth="2" />
            </g>
          )}

          {/* Tiny open notebook prop in FOCUS mode */}
          {effectiveMood === CloudMood.FOCUS && size !== 'sm' && (
            <g transform="translate(86, 127)">
              <path
                d="M2 5C10 2 18 2 24 6C30 2 38 2 46 5V21C38 18 30 18 24 22C18 18 10 18 2 21V5Z"
                fill="#FFFFFF"
                stroke="#475569"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <line x1="24" y1="6" x2="24" y2="22" stroke="#94A3B8" strokeWidth="1.6" />
            </g>
          )}
        </svg>
      </Wrapper>
    </div>
  );
};
