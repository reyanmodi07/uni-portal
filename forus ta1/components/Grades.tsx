
import React, { useState } from 'react';
import { Semester, GradeSubject } from '../types';
import { Plus, Trash2, Calculator, TrendingUp, Award } from 'lucide-react';
// Casting motion to any
import { motion as m, AnimatePresence } from 'framer-motion';
const motion = m as any;

interface GradesProps {
  semesters: Semester[];
  setSemesters: React.Dispatch<React.SetStateAction<Semester[]>>;
}

const GRADE_POINTS: { [key: string]: number } = {
  'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0
};

const Grades: React.FC<GradesProps> = ({ semesters, setSemesters }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSemId, setActiveSemId] = useState<string | null>(null);

  // Form states for new subject
  const [subName, setSubName] = useState('');
  const [credits, setCredits] = useState(3);
  const [grade, setGrade] = useState('A');

  const addSemester = () => {
    const newSem: Semester = {
      id: Date.now().toString(),
      name: `Semester ${semesters.length + 1}`,
      subjects: []
    };
    setSemesters([...semesters, newSem]);
  };

  const addSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSemId) return;

    const newSub: GradeSubject = {
      id: Date.now().toString(),
      name: subName,
      credits: Number(credits),
      grade
    };

    setSemesters(prev => prev.map(sem => {
      if (sem.id === activeSemId) {
        return { ...sem, subjects: [...sem.subjects, newSub] };
      }
      return sem;
    }));

    setSubName('');
    setIsModalOpen(false);
  };

  const calculateSGPA = (subjects: GradeSubject[]) => {
    if (subjects.length === 0) return 0;
    const totalPoints = subjects.reduce((acc, sub) => acc + (sub.credits * (GRADE_POINTS[sub.grade] || 0)), 0);
    const totalCredits = subjects.reduce((acc, sub) => acc + sub.credits, 0);
    return totalCredits === 0 ? 0 : (totalPoints / totalCredits).toFixed(2);
  };

  const calculateCGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;
    
    semesters.forEach(sem => {
      sem.subjects.forEach(sub => {
        totalPoints += sub.credits * (GRADE_POINTS[sub.grade] || 0);
        totalCredits += sub.credits;
      });
    });

    return totalCredits === 0 ? '0.00' : (totalPoints / totalCredits).toFixed(2);
  };

  const cgpa = parseFloat(calculateCGPA());
  
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
           Grades
         </h2>
         <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">Track your academic performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CGPA Summary Gauge Card */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-between relative overflow-hidden min-h-[320px]">
           <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4 z-10 self-start flex items-center gap-2">
              <Award className="w-5 h-5 text-violet-500" />
              Overall CGPA
           </h2>
           
           <div className="relative w-full flex-1 flex flex-col items-center justify-center z-10">
              {/* Semi-Circle Gauge */}
              <div className="relative w-64 h-32">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 200 100">
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="50%" stopColor="#d946ef" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    
                    {/* Background Track */}
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" className="text-zinc-100 dark:text-zinc-800" />
                    
                    {/* Progress Arc */}
                    <motion.path 
                        d="M 20 100 A 80 80 0 0 1 180 100" 
                        fill="none" 
                        stroke="url(#gaugeGradient)" 
                        strokeWidth="12" 
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: cgpa / 10 }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        style={{ filter: "url(#glow)" }}
                    />
                  </svg>
                  
                  {/* Score Text */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 flex flex-col items-center">
                       <motion.span 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: 0.5 }}
                         className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500 tracking-tighter"
                       >
                         {cgpa}
                       </motion.span>
                  </div>
              </div>
           </div>
           
           <div className="mt-6 text-center z-10">
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 dark:bg-violet-900/10 rounded-xl border border-violet-100 dark:border-violet-900/30">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                  </span>
                  <span className="text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wide">
                      {cgpa > 9 ? "Excellent" : cgpa > 8 ? "Very Good" : cgpa > 7 ? "Good" : "Average"}
                  </span>
               </div>
               <p className="text-xs text-zinc-400 mt-3 font-medium max-w-[200px] mx-auto leading-relaxed">
                  Based on {semesters.length} semesters of performance.
               </p>
           </div>

           {/* Decorative Elements */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div variants={itemVariants} className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-10 text-white flex flex-col justify-center relative overflow-hidden shadow-2xl shadow-indigo-200 dark:shadow-none">
           <div className="relative z-10">
             <h2 className="text-3xl font-bold mb-6">Academic Overview</h2>
             <div className="flex gap-12">
                <div>
                   <p className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-1">Total Semesters</p>
                   <p className="text-5xl font-black tracking-tighter">{semesters.length}</p>
                </div>
                <div>
                   <p className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-1">Total Credits</p>
                   <p className="text-5xl font-black tracking-tighter">
                      {semesters.reduce((acc, sem) => acc + sem.subjects.reduce((sAcc, sub) => sAcc + sub.credits, 0), 0)}
                   </p>
                </div>
             </div>
             <button 
                onClick={addSemester}
                className="mt-8 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 w-fit active:scale-95"
             >
                <Plus className="w-4 h-4" /> Add New Semester
             </button>
           </div>
           <div className="absolute bottom-[-10%] right-[-5%] opacity-20 rotate-12">
              <TrendingUp className="w-56 h-56" />
           </div>
        </motion.div>
      </div>

      {/* Semester List */}
      <div className="space-y-6">
        {semesters.map(sem => (
          <motion.div variants={itemVariants} key={sem.id} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 px-8 py-6 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-xl text-zinc-900 dark:text-white">{sem.name}</h3>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  SGPA: <span className="text-emerald-500 font-black text-base ml-1">{calculateSGPA(sem.subjects)}</span>
                </span>
                <button 
                  onClick={() => { setActiveSemId(sem.id); setIsModalOpen(true); }}
                  className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-8">
              {sem.subjects.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800">
                        <th className="pb-4 text-xs font-black text-zinc-400 uppercase tracking-widest">Subject</th>
                        <th className="pb-4 text-xs font-black text-zinc-400 uppercase tracking-widest">Credits</th>
                        <th className="pb-4 text-xs font-black text-zinc-400 uppercase tracking-widest">Grade</th>
                        <th className="pb-4 text-xs font-black text-zinc-400 uppercase tracking-widest">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {sem.subjects.map(sub => (
                        <tr key={sub.id}>
                          <td className="py-4 text-base font-bold text-zinc-900 dark:text-white">{sub.name}</td>
                          <td className="py-4 text-base font-medium text-zinc-500 dark:text-zinc-400">{sub.credits}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-black ${
                              ['O', 'A+', 'A'].includes(sub.grade) ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                            }`}>
                              {sub.grade}
                            </span>
                          </td>
                          <td className="py-4 text-base font-medium text-zinc-500 dark:text-zinc-400">{GRADE_POINTS[sub.grade] * sub.credits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-zinc-400 font-medium">No subjects added. Click + to add.</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-[3rem] p-10 w-full max-w-sm shadow-2xl border border-zinc-200 dark:border-zinc-800"
          >
            <h3 className="text-2xl font-black mb-6 text-zinc-900 dark:text-white tracking-tight">Add Subject</h3>
            <form onSubmit={addSubject} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Subject Name</label>
                <input 
                  type="text" 
                  value={subName}
                  onChange={e => setSubName(e.target.value)}
                  className="w-full px-5 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Credits</label>
                    <input 
                      type="number" 
                      value={credits}
                      onChange={e => setCredits(Number(e.target.value))}
                      className="w-full px-5 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-bold"
                      min="1" max="10"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Grade</label>
                    <div className="relative">
                        <select 
                          value={grade}
                          onChange={e => setGrade(e.target.value)}
                          className="w-full px-5 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-bold appearance-none"
                        >
                          {Object.keys(GRADE_POINTS).map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                    </div>
                 </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-zinc-500 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all">Add Subject</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Grades;
