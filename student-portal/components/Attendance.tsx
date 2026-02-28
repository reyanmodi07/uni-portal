
import React from 'react';
import { Subject } from '../types';
import { Plus, Minus, AlertTriangle, RotateCcw, CheckCircle2, ShieldCheck, ShieldAlert } from 'lucide-react';
// Casting motion to any
import { motion as m } from 'framer-motion';
const motion = m as any;

interface AttendanceProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
}

const Attendance: React.FC<AttendanceProps> = ({ subjects, setSubjects }) => {
  const updateAttendance = (id: string, type: 'present' | 'absent' | 'undo_present' | 'undo_absent') => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id !== id) return sub;
      
      let newAttended = sub.attended;
      let newAbsent = sub.absent;
      const conducted = sub.attended + sub.absent;

      if ((type === 'present' || type === 'absent') && conducted >= sub.total) {
          return sub;
      }

      if (type === 'present') { newAttended++; }
      else if (type === 'absent') { newAbsent++; }
      else if (type === 'undo_present') { newAttended = Math.max(0, newAttended - 1); }
      else if (type === 'undo_absent') { newAbsent = Math.max(0, newAbsent - 1); }

      return { ...sub, attended: newAttended, absent: newAbsent };
    }));
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
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">
          Attendance
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">
          Manage your academic streak and track leaves.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map(sub => {
          const conducted = sub.attended + sub.absent;
          const currentPercentage = conducted > 0 ? (sub.attended / conducted) * 100 : 0;
          const isCritical = currentPercentage < 75;
          const isFinished = conducted >= sub.total;
          const maxAllowedLeaves = Math.floor(sub.total * 0.25);
          const remainingSafeLeaves = maxAllowedLeaves - sub.absent;
          
          return (
            <motion.div variants={itemVariants} key={sub.id} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col group relative overflow-hidden transition-all hover:shadow-2xl hover:border-violet-300 dark:hover:border-violet-800">
              <div className="flex justify-between items-start mb-6 z-10">
                <div className="flex-1 min-w-0 mr-4">
                    <h3 className="font-extrabold text-2xl text-zinc-900 dark:text-white truncate tracking-tight">{sub.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                        {isCritical ? (
                             <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
                                <ShieldAlert className="w-3.5 h-3.5" /> Critical
                             </span>
                        ) : (
                             <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                                <ShieldCheck className="w-3.5 h-3.5" /> On Track
                             </span>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <span className={`text-4xl font-black tracking-tighter ${isCritical ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {Math.round(currentPercentage)}%
                    </span>
                </div>
              </div>

              <div className="w-full h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-8 z-10 p-1">
                 <div className={`h-full rounded-full transition-all duration-1000 ease-out ${isCritical ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${currentPercentage}%` }} />
              </div>

              <div className="grid grid-cols-4 gap-2 text-center mb-8 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800/50 z-10">
                 <div>
                    <p className="font-black text-zinc-900 dark:text-white text-xl">{sub.attended}</p>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Present</p>
                 </div>
                 <div>
                    <p className="font-black text-zinc-900 dark:text-white text-xl">{sub.absent}</p>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Absent</p>
                 </div>
                 <div>
                    <p className="font-black text-zinc-900 dark:text-white text-xl">{conducted}</p>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Done</p>
                 </div>
                 <div>
                    <p className="font-black text-zinc-400 dark:text-zinc-600 text-xl">{sub.total}</p>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Total</p>
                 </div>
              </div>

              <div className="mb-8 z-10">
                 {remainingSafeLeaves < 0 ? (
                     <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-start gap-3 bg-rose-50 dark:bg-rose-900/10 p-5 rounded-3xl border border-rose-100 dark:border-rose-900/20">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <p className="leading-relaxed">Warning: You are below the 75% threshold. Attendance recovery needed.</p>
                     </div>
                 ) : (
                     <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-start gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
                        <p className="leading-relaxed">Safe Zone: You can miss <strong className="text-zinc-900 dark:text-zinc-200">{remainingSafeLeaves}</strong> more classes.</p>
                     </div>
                 )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto z-10">
                <button onClick={() => updateAttendance(sub.id, 'present')} disabled={isFinished} className="flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 disabled:opacity-30 shadow-lg hover:shadow-xl">
                  <Plus className="w-4 h-4" /> Present
                </button>
                <button onClick={() => updateAttendance(sub.id, 'absent')} disabled={isFinished} className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-rose-500 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 disabled:opacity-30 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                  <Minus className="w-4 h-4" /> Absent
                </button>
              </div>

              <div className="flex justify-center gap-8 mt-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => updateAttendance(sub.id, 'undo_present')} disabled={sub.attended === 0} className="text-[10px] font-black text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-20 flex items-center gap-2 uppercase tracking-widest transition-all">
                    <RotateCcw className="w-3 h-3" /> Undo Present
                 </button>
                 <button onClick={() => updateAttendance(sub.id, 'undo_absent')} disabled={sub.absent === 0} className="text-[10px] font-black text-zinc-400 hover:text-rose-500 disabled:opacity-20 flex items-center gap-2 uppercase tracking-widest transition-all">
                    <RotateCcw className="w-3 h-3" /> Undo Absent
                 </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Attendance;
