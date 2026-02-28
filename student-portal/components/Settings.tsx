
import React, { useState } from 'react';
import { Subject } from '../types';
import { Save, Trash2, RotateCcw, User, School, BookOpen, AlertCircle, Plus } from 'lucide-react';
// Casting motion to any
import { motion as m } from 'framer-motion';
const motion = m as any;

interface SettingsProps {
  userName: string;
  setUserName: (name: string) => void;
  university: string;
  setUniversity: (uni: string) => void;
  course: string;
  setCourse: (course: string) => void;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  resetApp: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  userName, setUserName, 
  university, setUniversity,
  course, setCourse,
  subjects, setSubjects,
  resetApp
}) => {
  const [localName, setLocalName] = useState(userName);
  const [localUni, setLocalUni] = useState(university);
  const [localCourse, setLocalCourse] = useState(course);
  const [isSaved, setIsSaved] = useState(false);
  
  // Subject Management
  const [newSubName, setNewSubName] = useState('');
  const [newSubTotal, setNewSubTotal] = useState(40);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUserName(localName);
    setUniversity(localUni);
    setCourse(localCourse);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName) return;
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: newSubName,
      attended: 0,
      absent: 0,
      total: Number(newSubTotal)
    };
    setSubjects(prev => [...prev, newSubject]);
    setNewSubName('');
    setNewSubTotal(40);
  };

  const handleDeleteSubject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject? All attendance data for it will be lost.')) {
      setSubjects(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleReset = () => {
    if (window.confirm('WARNING: This will delete ALL your data including attendance, tasks, and settings. This action cannot be undone.')) {
      resetApp();
    }
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
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col gap-2">
         <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">Settings</h2>
         <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">Manage your profile and preferences.</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Section */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
           <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
              <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl text-violet-600 dark:text-violet-400">
                 <User className="w-6 h-6" />
              </div>
              Profile Information
           </h3>
           
           <form onSubmit={handleSaveProfile} className="space-y-8 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                       <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                       <input 
                         type="text" 
                         value={localName}
                         onChange={e => setLocalName(e.target.value)}
                         className="w-full pl-12 pr-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white font-bold text-lg"
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">University</label>
                    <div className="relative">
                       <School className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                       <input 
                         type="text" 
                         value={localUni}
                         onChange={e => setLocalUni(e.target.value)}
                         className="w-full pl-12 pr-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white font-bold text-lg"
                       />
                    </div>
                 </div>
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Course / Major</label>
                    <div className="relative">
                       <BookOpen className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                       <input 
                         type="text" 
                         value={localCourse}
                         onChange={e => setLocalCourse(e.target.value)}
                         className="w-full pl-12 pr-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white font-bold text-lg"
                       />
                    </div>
                 </div>
              </div>
              
              <div className="flex items-center gap-6">
                 <button 
                   type="submit" 
                   className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-violet-200 dark:shadow-none"
                 >
                    <Save className="w-5 h-5" /> Save Changes
                 </button>
                 {isSaved && (
                    <motion.span 
                       initial={{ opacity: 0, x: -10 }} 
                       animate={{ opacity: 1, x: 0 }}
                       className="text-emerald-500 text-sm font-bold flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 rounded-xl"
                    >
                       <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                       Saved Successfully!
                    </motion.span>
                 )}
              </div>
           </form>
        </motion.div>

        {/* Subject Management */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
           <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                 <BookOpen className="w-6 h-6" />
              </div>
              Manage Subjects
           </h3>

           <div className="space-y-4 mb-8">
              {subjects.map(sub => (
                 <div key={sub.id} className="flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-zinc-700">
                    <div>
                       <p className="font-bold text-lg text-zinc-900 dark:text-white">{sub.name}</p>
                       <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-1">Total Classes: {sub.total}</p>
                    </div>
                    <button 
                       onClick={() => handleDeleteSubject(sub.id)}
                       className="p-3 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-colors"
                       title="Delete Subject"
                    >
                       <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
              ))}
           </div>

           <form onSubmit={handleAddSubject} className="flex flex-col md:flex-row gap-4 items-end p-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700">
              <div className="space-y-1 flex-1 w-full">
                 <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">New Subject Name</label>
                 <input 
                   type="text" 
                   value={newSubName}
                   onChange={e => setNewSubName(e.target.value)}
                   className="w-full px-6 py-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-bold"
                   placeholder="e.g. Microprocessors"
                 />
              </div>
              <div className="space-y-1 w-full md:w-40">
                 <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Total Classes</label>
                 <input 
                   type="number" 
                   value={newSubTotal}
                   onChange={e => setNewSubTotal(Number(e.target.value))}
                   className="w-full px-6 py-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-bold"
                 />
              </div>
              <button 
                 type="submit"
                 disabled={!newSubName}
                 className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                 <Plus className="w-5 h-5" /> Add
              </button>
           </form>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={itemVariants} className="bg-rose-50 dark:bg-rose-900/10 p-8 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/20">
           <h3 className="text-2xl font-black text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-3">
              <AlertCircle className="w-6 h-6" />
              Danger Zone
           </h3>
           <p className="text-rose-600/80 dark:text-rose-400/80 font-medium mb-8 max-w-xl">
              Resetting the application will permanently delete all your local data including attendance, grades, and tasks. This action cannot be undone.
           </p>
           <button 
             onClick={handleReset}
             className="px-8 py-4 bg-white dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
           >
              <RotateCcw className="w-5 h-5" /> Reset Application Data
           </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Settings;
