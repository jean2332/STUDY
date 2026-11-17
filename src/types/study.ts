export enum AppTab {
  STUDY = 'study',
  TASKS = 'tasks',
  CIRCLES = 'circles',
  PROGRESS = 'progress',
}

export enum TimerMode {
  FOCUS = 'focus',
  DEEP = 'deep',
  SHORT_BREAK = 'shortBreak',
  LONG_BREAK = 'longBreak',
}

export enum CloudMood {
  IDLE = 'idle',
  FOCUS = 'focus',
  BREAK = 'break',
  CELEBRATE = 'celebrate',
  BLUSH = 'blush',
}

export interface TimerPreset {
  mode: TimerMode;
  label: string;
  shortLabel: string;
  minutes: number;
  isBreak: boolean;
  description: string;
}

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  completed: boolean;
  pomodorosDone: number;
  pomodorosTarget: number;
}

export interface CircleCompanion {
  id: string;
  name: string;
  subject: string;
  mood: CloudMood;
  minutesIn: number;
}

export interface StudyCircleRoom {
  id: string;
  name: string;
  cadenceLabel: string;
  recommendedMode: TimerMode;
  atmosphere: string;
  companions: CircleCompanion[];
}

export interface DailyProgress {
  dateKey: string;
  focusedMinutes: number;
  completedBlocks: number;
  streakDays: number;
}

export interface WeeklyHistoryRecord {
  [dateKey: string]: {
    focusedMinutes: number;
    completedBlocks: number;
  };
}
