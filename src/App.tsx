/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { StudyStudio } from './components/StudyStudio';
import { StudyCircles } from './components/StudyCircles';
import { HowItWorks } from './components/HowItWorks';
import { FaqFooter } from './components/FaqFooter';
import { StudyCircleRoom, TimerMode } from './types/study';

export default function App() {
  const [timerMode, setTimerMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [activeCircle, setActiveCircle] = useState<StudyCircleRoom | null>(null);
  const [focusTrigger, setFocusTrigger] = useState(0);

  const scrollToStudio = () => {
    const el = document.getElementById('estudio');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setFocusTrigger((prev) => prev + 1);
  };

  const handleJoinCircle = (room: StudyCircleRoom) => {
    setActiveCircle(room);
    setTimerMode(room.recommendedMode);
    scrollToStudio();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <Header onStartStudy={scrollToStudio} />

      <main className="flex-1">
        <HeroSection onOpenStudio={scrollToStudio} />

        <StudyStudio
          mode={timerMode}
          onModeChange={setTimerMode}
          activeCircle={activeCircle}
          onLeaveCircle={() => setActiveCircle(null)}
          focusTrigger={focusTrigger}
        />

        <StudyCircles activeCircle={activeCircle} onJoinCircle={handleJoinCircle} />

        <HowItWorks />
      </main>

      <FaqFooter />
    </div>
  );
}
