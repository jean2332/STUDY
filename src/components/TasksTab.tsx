import React, { useRef, useState } from 'react';
import { Check, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { StudyTask } from '../types/study';
import { BottomSheet } from './BottomSheet';

export const SUBJECT_OPTIONS = [
  'General',
  'Matemáticas',
  'Ciencias',
  'Idiomas',
  'Lectura',
  'Programación',
  'Historia',
];

interface TasksTabProps {
  tasks: StudyTask[];
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
  onAddTask: (title: string, subject: string) => void;
  onToggleTaskDone: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  tasks,
  selectedTaskId,
  onSelectTask,
  onAddTask,
  onToggleTaskDone,
  onDeleteTask,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('General');
  const [subjectSheetOpen, setSubjectSheetOpen] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>('Todas');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTaskTitle.trim();
    if (!trimmed) {
      setErrorMsg('Escribe una tarea antes de agregar.');
      inputRef.current?.focus();
      return;
    }
    setErrorMsg('');
    onAddTask(trimmed, newTaskSubject);
    setNewTaskTitle('');
  };

  const usedSubjects = ['Todas', ...Array.from(new Set(tasks.map((t) => t.subject)))];
  const visibleTasks =
    filterSubject === 'Todas' ? tasks : tasks.filter((t) => t.subject === filterSubject);

  return (
    <div className="px-4 py-4 space-y-4 w-full overflow-x-hidden">
      {/* Add Task Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 space-y-3"
      >
        <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
          Agregar materia o tarea
        </h2>

        <div className="flex gap-2 w-full min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={newTaskTitle}
            onChange={(e) => {
              setNewTaskTitle(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="¿Qué vas a estudiar?"
            aria-label="Nueva tarea de estudio"
            className="flex-1 min-w-0 min-h-[44px] px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            aria-label="Agregar tarea"
            className="min-h-[44px] min-w-[44px] px-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 active:scale-95 rounded-2xl transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        </div>

        {/* Bottom Sheet Trigger for Subject (replaces native <select>) */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setSubjectSheetOpen(true)}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer max-w-full"
          >
            <span className="text-slate-500 dark:text-slate-400 font-normal">Materia:</span>
            <span className="truncate">{newTaskSubject}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          {errorMsg && <span className="text-xs text-rose-600 dark:text-rose-400 truncate">{errorMsg}</span>}
        </div>
      </form>

      {/* Filter Subject Touch Chips (wrapping cleanly, zero horizontal scroll) */}
      {tasks.length > 0 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por materia">
          {usedSubjects.map((subj) => {
            const active = filterSubject === subj;
            return (
              <button
                key={subj}
                type="button"
                onClick={() => setFilterSubject(subj)}
                className={`min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                  active
                    ? 'bg-sky-600 text-white'
                    : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {subj}
              </button>
            );
          })}
        </div>
      )}

      {/* Task Cards List (strictly zero horizontal overflow) */}
      {visibleTasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No hay tareas en esta vista. Agrega una materia arriba para enfocar tu próximo bloque.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5 w-full min-w-0">
          {visibleTasks.map((task) => {
            const isSelected = task.id === selectedTaskId;
            return (
              <li
                key={task.id}
                className={`w-full min-w-0 rounded-2xl border p-3 flex items-center gap-2 transition-colors ${
                  isSelected
                    ? 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-400 dark:border-sky-600'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onToggleTaskDone(task.id)}
                  aria-label={
                    task.completed
                      ? `Marcar "${task.title}" como pendiente`
                      : `Marcar "${task.title}" como completada`
                  }
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <span
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-sky-600 border-sky-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {task.completed && <Check className="w-4 h-4" />}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTask(task.id)}
                  className="flex-1 min-w-0 min-h-[44px] text-left py-1 cursor-pointer focus:outline-none"
                >
                  <p
                    className={`text-sm font-semibold break-words ${
                      task.completed
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    <span>{task.subject}</span>
                    <span aria-hidden="true"> · </span>
                    <span className="font-mono tabular-nums">
                      {task.pomodorosDone}/{task.pomodorosTarget} bloques
                    </span>
                    {isSelected && !task.completed && (
                      <>
                        <span aria-hidden="true"> · </span>
                        <span className="font-semibold text-sky-600 dark:text-sky-400">
                          En curso
                        </span>
                      </>
                    )}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  aria-label={`Eliminar "${task.title}"`}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Subject Picker Bottom Sheet */}
      <BottomSheet
        open={subjectSheetOpen}
        onClose={() => setSubjectSheetOpen(false)}
        title="Seleccionar materia"
      >
        <div className="grid grid-cols-2 gap-2.5 pb-2">
          {SUBJECT_OPTIONS.map((subj) => {
            const active = newTaskSubject === subj;
            return (
              <button
                key={subj}
                type="button"
                onClick={() => {
                  setNewTaskSubject(subj);
                  setSubjectSheetOpen(false);
                }}
                className={`min-h-[48px] px-4 py-3 rounded-2xl border text-sm font-semibold flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                  active
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300'
                    : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <span className="truncate">{subj}</span>
                {active && <Check className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
};
