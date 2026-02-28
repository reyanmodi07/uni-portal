
import React, { useState } from 'react';
import { ClassSession } from '../types';
import { Plus, Trash2, Clock, MapPin } from 'lucide-react';
// Casting motion to any
import { motion as m, AnimatePresence } from 'framer-motion';
const motion = m as any;

interface TimetableProps {
  timetable: ClassSession[];
  setTimetable: React.Dispatch<React.SetStateAction<ClassSession[]>>;
}

const Timetable: React.FC<TimetableProps> = ({ timetable, setTimetable }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [activeDay, setActiveDay] = useState('Mon');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newSubject, setNewSubject] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  const currentClasses = timetable
    .filter(c => c.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const addClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newStart || !newEnd) return;
    
    const newSession: ClassSession = {
      id: Date.now().toString(),
      day: activeDay,
      subject: newSubject,
      startTime: newStart,
      endTime: newEnd
    };
    
    setTimetable([...timetable, newSession]);
    setNewSubject('');
    setNewStart('');
    setNewEnd('');
    setIsModalOpen(false);
  };

  const deleteClass = (id: string) => {
    setTimetable(timetable.filter(c => c.id !== id));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">
            Timetable
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">
            Your weekly academic structure.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl transition-all active:scale-95 hover:scale-105"
        >
          <Plus className="w-5 h-5" /> Add Class
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${
              activeDay === day
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent shadow-xl scale-105'
                : 'bg-white dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-4">
        <AnimatePresence mode="popLayout">
          {currentClasses.length > 0 ? (
            currentClasses.map(session => (
              <motion.div 
                key={session.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center gap-8 shadow-sm hover:shadow-2xl hover:border-violet-200 dark:hover:border-violet-800 transition-all"
              >
                <div className="flex flex-row sm:flex-col items-center sm:w-32 sm:border-r border-zinc-100 dark:border-zinc-800 sm:pr-8 gap-4 sm:gap-2">
                   <div className="flex flex-row sm:flex-col items-center gap-2 sm:gap-1">
                      <span className="text-2xl font-black text-zinc-900 dark:text-white leading-none tracking-tight">{session.startTime}</span>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{session.endTime}</span>
                   </div>
                </div>
                <div className="flex-1">
                   <h3 className="font-black text-2xl text-zinc-900 dark:text-white tracking-tight">{session.subject}</h3>
                   <div className="flex items-center gap-4 mt-3">
                      <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        <MapPin className="w-3.5 h-3.5" /> Lecture Hall A
                      </p>
                   </div>
                </div>
                <button 
                  onClick={() => deleteClass(session.id)}
                  className="p-4 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all self-end sm:self-auto"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-64 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem] bg-zinc-50/50 dark:bg-zinc-900/30">
               <div className="w-24 h-24 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <Clock className="w-10 h-10 opacity-30" />
               </div>
               <p className="font-black uppercase text-xs tracking-[0.2em]">No Sessions Scheduled</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-[3rem] p-10 w-full max-w-lg shadow-2xl border border-zinc-200 dark:border-zinc-800"
          >
            <h3 className="text-3xl font-black mb-8 text-zinc-900 dark:text-white tracking-tighter">Add Session</h3>
            <form onSubmit={addClass} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Subject Title</label>
                <input 
                  type="text" 
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white font-bold"
                  placeholder="e.g. Data Science"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Start Time</label>
                  <input 
                    type="time" 
                    value={newStart}
                    onChange={e => setNewStart(e.target.value)}
                    className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white font-bold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">End Time</label>
                  <input 
                    type="time" 
                    value={newEnd}
                    onChange={e => setNewEnd(e.target.value)}
                    className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white font-bold"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 text-zinc-500 font-black text-xs uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Add Session</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Timetable;
