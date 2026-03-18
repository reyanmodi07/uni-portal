
import React, { useState } from 'react';
import { Task } from '../types';
import { Trash2, Flag, Plus, Check, Sparkles, CalendarDays } from 'lucide-react';
import confetti from 'canvas-confetti';
// Casting motion to any
import { motion as m, AnimatePresence } from 'framer-motion';
const motion = m as any;

interface TasksProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const Tasks: React.FC<TasksProps> = ({ tasks, setTasks }) => {
  const [newTask, setNewTask] = useState('');
  const [newDate, setNewDate] = useState('');
  const [isHighPri, setIsHighPri] = useState(false);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      dueDate: newDate || new Date().toISOString().split('T')[0],
      isHighPriority: isHighPri,
      completed: false
    };

    setTasks([...tasks, task]);
    setNewTask('');
    setNewDate('');
    setIsHighPri(false);
  };

  const toggleTask = (id: string) => {
    setTasks(prevTasks => {
      const task = prevTasks.find(t => t.id === id);
      if (task && !task.completed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#d946ef', '#10b981']
        });
      }
      return prevTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    });
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) {
      if (a.isHighPriority === b.isHighPriority) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return a.isHighPriority ? -1 : 1;
    }
    return a.completed ? 1 : -1;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
         <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white flex items-center gap-3">
           <Sparkles className="w-10 h-10 text-amber-400 fill-current" />
           Missions
         </h2>
         <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">Crush your daily objectives.</p>
      </div>

      <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 p-4 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200 dark:border-zinc-800">
        <form onSubmit={addTask} className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                className="w-full pl-8 pr-6 py-6 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white placeholder:text-zinc-400 font-bold text-lg transition-all"
                placeholder="What's the next mission?"
              />
            </div>
            <div className="flex gap-4 h-full">
              <div className="relative flex-1 lg:flex-initial lg:w-56">
                 <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <CalendarDays className="w-5 h-5 text-zinc-400" />
                 </div>
                 <input 
                  type="date" 
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full pl-14 pr-6 py-6 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white text-sm font-bold h-full"
                />
              </div>
              <button 
                type="button" 
                onClick={() => setIsHighPri(!isHighPri)}
                className={`flex-1 lg:flex-none px-8 rounded-[2rem] transition-all flex items-center justify-center gap-2 ${
                  isHighPri 
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-none' 
                    : 'bg-zinc-50 text-zinc-400 dark:bg-zinc-800/50 dark:text-zinc-500 border border-zinc-100 dark:border-zinc-700'
                }`}
                title="Toggle Priority"
              >
                <Flag className={`w-6 h-6 ${isHighPri ? 'fill-current' : ''}`} />
                <span className="lg:hidden text-xs font-black uppercase">Urgent</span>
              </button>
              <button 
                type="submit" 
                className="hidden lg:flex px-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[2rem] font-black text-sm items-center justify-center hover:scale-105 active:scale-95 shadow-xl shadow-zinc-200 dark:shadow-none transition-all uppercase tracking-widest"
              >
                ADD
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            className="lg:hidden w-full py-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-widest"
          >
            <Plus className="w-5 h-5" /> ADD MISSION
          </button>
        </form>
      </motion.div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {sortedTasks.map((task) => (
            <motion.div 
              layout
              key={task.id} 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`group flex items-center gap-6 p-6 sm:p-8 rounded-[2.5rem] border transition-all duration-300 ${
                task.completed 
                  ? 'bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-800/50 opacity-60' 
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:border-violet-200 dark:hover:border-violet-800'
              }`}
            >
              <button 
                onClick={() => toggleTask(task.id)}
                className={`w-10 h-10 rounded-2xl border-[3px] flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
                  task.completed 
                    ? 'bg-emerald-500 border-emerald-500 text-white rotate-0' 
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-violet-500 text-transparent'
                }`}
              >
                <Check className={`w-6 h-6 ${task.completed ? 'block' : 'hidden'}`} strokeWidth={4} />
              </button>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleTask(task.id)}>
                <p className={`font-bold text-lg sm:text-xl transition-all truncate ${task.completed ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-white'}`}>
                  {task.title}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                     <CalendarDays className="w-3.5 h-3.5" />
                     {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  {task.isHighPriority && (
                    <span className="text-[10px] font-black tracking-widest text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900/50 uppercase">Urgent</span>
                  )}
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                className="p-4 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {sortedTasks.length === 0 && (
           <div className="flex flex-col items-center justify-center py-24 text-zinc-400 text-center bg-white/50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
             <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-8">
                <Sparkles className="w-12 h-12 text-emerald-500" />
             </div>
             <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-widest">No Missions</h3>
             <p className="max-w-xs px-6 font-medium text-lg">All caught up! Time to recharge or level up your skills.</p>
           </div>
        )}
      </div>
    </motion.div>
  );
};

export default Tasks;
