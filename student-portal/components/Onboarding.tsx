
import React, { useState, useEffect } from 'react';
// Casting motion to any to avoid "Property does not exist" errors in this environment
import { motion as m, AnimatePresence } from 'framer-motion';
const motion = m as any;
import { User, School, BookOpen, ArrowRight, Plus, Trash2, Loader2, ArrowLeft, GraduationCap } from 'lucide-react';
import { Subject } from '../types';

interface OnboardingProps {
  onComplete: (name: string, university: string, major: string, subjects: Subject[]) => void;
}

const UNIVERSITIES = [
  "Ahmedabad University",
  "Nirma University",
  "Stanford University",
  "MIT",
  "Other"
];

const MAJORS_BY_UNI: Record<string, string[]> = {
  "Ahmedabad University": [
    "B.Tech (Computer Science & Engineering)",
    "B.Tech (Mechanical Engineering)",
    "BBA (Hons.)",
    "B.Com (Hons.)",
    "BA (Hons.) (Humanities & Social Sciences)",
    "B.Sc. (Sciences)",
    "Integrated B.Sc + M.Sc",
    "MBA (Management)",
    "M.Tech (Engineering)",
    "MA (Arts & Humanities)",
    "M.Sc (Sciences)",
    "Ph.D (Engineering)",
    "Ph.D (Management)",
    "Ph.D (Arts & Sciences)"
  ],
  "Nirma University": [
    "B.Tech (Computer Science & Engineering)",
    "B.Tech (Information Technology)",
    "B.Tech (Chemical Engineering)",
    "B.Tech (Civil Engineering)",
    "B.Tech (Electronics & Communication)",
    "B.Tech (Electrical Engineering)",
    "B.Tech (Mechanical Engineering)",
    "B.Tech (Instrumentation & Control)",
    "B.Arch (Architecture)",
    "B.Pharm (Pharmacy)",
    "BBA (Management)",
    "B.Com (Hons.)",
    "B.Sc. (Sciences)",
    "MBA (Full Time)",
    "M.Tech (Various Disciplines)",
    "Ph.D"
  ],
  "Stanford University": ["Computer Science", "Artificial Intelligence", "Symbolic Systems", "Bio-Engineering", "Human Biology", "Political Science"],
  "MIT": ["EECS", "Mechanical Engineering", "Mathematics", "Physics", "Brain and Cognitive Sciences", "Architecture"],
  "Other": ["Computer Science", "Business Administration", "Mechanical Engineering", "Electrical Engineering", "Psychology", "Economics", "Liberal Arts", "General Science"]
};

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState(UNIVERSITIES[0]);
  const [course, setCourse] = useState(MAJORS_BY_UNI[UNIVERSITIES[0]][0]);
  const [subjects, setSubjects] = useState<{name: string, total: number}[]>([{ name: '', total: 40 }]);

  // Update course when university changes
  useEffect(() => {
    const availableMajors = MAJORS_BY_UNI[university] || MAJORS_BY_UNI["Other"];
    setCourse(availableMajors[0]);
  }, [university]);

  const handleNext = () => { 
    if (step === 1 && fullName && university && course) {
      setStep(2); 
    }
  };
  
  const handleBack = () => setStep(1);

  const handleFinish = () => {
    setIsLoading(true);
    setTimeout(() => {
        const finalSubjects: Subject[] = subjects.filter(s => s.name.trim() !== '').map((s, i) => ({
            id: Date.now().toString() + i,
            name: s.name,
            total: s.total,
            attended: 0,
            absent: 0
        }));
        onComplete(fullName, university, course, finalSubjects);
        setIsLoading(false);
    }, 1500);
  };

  const addSubjectRow = () => setSubjects([...subjects, { name: '', total: 40 }]);
  const removeSubjectRow = (index: number) => { 
    if (subjects.length > 1) setSubjects(subjects.filter((_, i) => i !== index)); 
  };
  
  const updateSubject = (index: number, field: 'name' | 'total', value: string | number) => {
    const newSubs = [...subjects];
    if (field === 'name') newSubs[index].name = value as string;
    if (field === 'total') newSubs[index].total = Number(value);
    setSubjects(newSubs);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-black relative overflow-hidden font-sans">
       {/* Static Background Image */}
       <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-zinc-50 dark:bg-[#09090b]" />
          <img 
             src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
             alt="Background"
             className="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-20 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-black/40 dark:via-transparent dark:to-transparent" />
       </div>

       <div className="z-10 w-full max-w-lg p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl border border-zinc-200 dark:border-zinc-800 rounded-[3rem] shadow-2xl overflow-hidden"
          >
             {/* Progress Bar */}
             <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 w-full flex">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: step === 1 ? '50%' : '100%' }} 
                  className="h-full bg-orange-600 transition-all duration-1000 ease-[0.16, 1, 0.3, 1]" 
                />
             </div>

             <div className="p-10">
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div 
                          key="step1" 
                          initial={{ opacity: 0, x: -20 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          exit={{ opacity: 0, x: 20 }} 
                          transition={{ duration: 0.5 }}
                          className="space-y-6"
                        >
                            <div className="mb-10">
                                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter mb-2">Identify.</h1>
                                <p className="text-zinc-500 dark:text-zinc-400 font-medium">Personalize your academic terminal.</p>
                            </div>

                            <div className="space-y-5">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                                      <User className="w-3.5 h-3.5" /> Full Name
                                    </label>
                                    <input 
                                      type="text" 
                                      value={fullName} 
                                      onChange={e => setFullName(e.target.value)} 
                                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-4 px-6 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold placeholder:font-normal" 
                                      placeholder="Alex Morgan" 
                                    />
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                                      <School className="w-3.5 h-3.5" /> University
                                    </label>
                                    <div className="relative">
                                      <select 
                                        value={university} 
                                        onChange={e => setUniversity(e.target.value)} 
                                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-4 px-6 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none appearance-none transition-all cursor-pointer font-bold"
                                      >
                                        {UNIVERSITIES.map(uni => <option key={uni} value={uni}>{uni}</option>)}
                                      </select>
                                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                        <ArrowRight className="w-4 h-4 rotate-90" />
                                      </div>
                                    </div>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                                      <GraduationCap className="w-3.5 h-3.5" /> Program of Study
                                    </label>
                                    <div className="relative">
                                      <select 
                                        value={course} 
                                        onChange={e => setCourse(e.target.value)} 
                                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-4 px-6 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none appearance-none transition-all cursor-pointer font-bold"
                                      >
                                        {(MAJORS_BY_UNI[university] || MAJORS_BY_UNI["Other"]).map(major => (
                                          <option key={major} value={major}>{major}</option>
                                        ))}
                                      </select>
                                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                        <ArrowRight className="w-4 h-4 rotate-90" />
                                      </div>
                                    </div>
                                </motion.div>
                            </div>

                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleNext} 
                              disabled={!fullName} 
                              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black py-5 rounded-2xl mt-4 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl"
                            >
                              CONTINUE 
                              <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div 
                          key="step2" 
                          initial={{ opacity: 0, x: 20 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          exit={{ opacity: 0, x: -20 }} 
                          className="space-y-6"
                        >
                            <div className="mb-10">
                                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter mb-2">Curriculum.</h1>
                                <p className="text-zinc-500 dark:text-zinc-400 font-medium">Add subjects for this semester.</p>
                            </div>

                            <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                {subjects.map((sub, idx) => (
                                    <motion.div 
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.05 }}
                                      key={idx} 
                                      className="flex gap-3 items-center"
                                    >
                                        <div className="flex-1">
                                          <input 
                                            type="text" 
                                            value={sub.name} 
                                            onChange={e => updateSubject(idx, 'name', e.target.value)} 
                                            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-4 text-sm dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold" 
                                            placeholder="Subject Name" 
                                          />
                                        </div>
                                        <div className="w-20">
                                          <input 
                                            type="number" 
                                            value={sub.total} 
                                            onChange={e => updateSubject(idx, 'total', e.target.value)} 
                                            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-2 py-4 text-sm text-center dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold" 
                                            title="Target Classes"
                                          />
                                        </div>
                                        <button 
                                          onClick={() => removeSubjectRow(idx)} 
                                          className="p-3 text-zinc-300 hover:text-rose-500 transition-colors"
                                        >
                                          <Trash2 className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>

                            <button 
                              onClick={addSubjectRow} 
                              className="w-full py-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-orange-500 hover:border-orange-500 transition-all flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Add Subject
                            </button>

                            <div className="flex gap-4 pt-4">
                                <button 
                                  onClick={handleBack} 
                                  className="px-6 py-5 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                  <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                                </button>
                                <button 
                                  onClick={handleFinish} 
                                  disabled={isLoading} 
                                  className="flex-1 bg-orange-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-orange-700 transition-all flex items-center justify-center"
                                >
                                  {isLoading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                  ) : (
                                    "FINISH SETUP"
                                  )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
             </div>
          </motion.div>
       </div>
    </div>
  );
};

export default Onboarding;
