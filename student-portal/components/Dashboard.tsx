
import React, { useState, useEffect } from 'react';
import { Subject, Task, ClassSession, View } from '../types';
import { Clock, Play, Pause, RotateCcw, Flame, Zap, Brain, Sparkles, Smile, Frown, Meh, ShieldCheck, ShieldAlert, ArrowRight, Target, Coffee, Lightbulb, TrendingUp, Plus, Minus, Check, X, Wind, Settings2 } from 'lucide-react';
// Casting motion to any and defining Variants locally as it may not be exported from the installed framer-motion version
import { motion as m, AnimatePresence } from 'framer-motion';
const motion = m as any;
type Variants = any;

interface DashboardProps {
  subjects: Subject[];
  tasks: Task[];
  timetable: ClassSession[];
  userName: string;
  setView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ subjects, tasks, timetable, userName, setView }) => {
  // --- Data Processing ---
  const totalAttended = subjects.reduce((acc, sub) => acc + sub.attended, 0);
  const totalConducted = subjects.reduce((acc, sub) => acc + sub.attended + sub.absent, 0);
  const avgAttendance = totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 100) : 100;
  
  // Subject Breakdown Data (Sorted by lowest attendance first)
  const subjectPerformance = subjects.map(sub => {
    const total = sub.attended + sub.absent;
    const percentage = total > 0 ? Math.round((sub.attended / total) * 100) : 100;
    return { ...sub, percentage, totalClasses: total };
  }).sort((a, b) => a.percentage - b.percentage);

  // Sort tasks by due date
  const upcomingTasks = tasks.filter(t => !t.completed).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 3);

  // Time-Aware Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return "Up Early";
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  const dayStr = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

  // --- Focus Timer State ---
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerMode, setTimerMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');
  const [isEditingTimer, setIsEditingTimer] = useState(false);
  
  // --- Wellness State ---
  const [mood, setMood] = useState<'Happy' | 'Neutral' | 'Stressed' | null>(null);
  
  // --- Daily Thought State ---
  const [dailyThought, setDailyThought] = useState<string>('');

  // Load timer settings & mood
  useEffect(() => {
    const savedFocus = localStorage.getItem('focus_duration');
    const savedBreak = localStorage.getItem('break_duration');
    const savedMood = localStorage.getItem('daily_mood');
    const savedMoodDate = localStorage.getItem('daily_mood_date');
    const today = new Date().toDateString();
    
    if (savedFocus) {
        const focus = parseInt(savedFocus);
        setFocusDuration(focus);
        if (timerMode === 'FOCUS' && !isTimerActive) setTimeLeft(focus * 60);
    }
    if (savedBreak) {
        const brk = parseInt(savedBreak);
        setBreakDuration(brk);
        if (timerMode === 'BREAK' && !isTimerActive) setTimeLeft(brk * 60);
    }
    
    if (savedMood && savedMoodDate === today) {
        setMood(savedMood as any);
    }
  }, []); // Run once on mount

  useEffect(() => {
    let interval: any;
    if (isTimerActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    else if (timeLeft === 0) {
        setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  useEffect(() => {
      const stored = localStorage.getItem('daily_thought');
      const storedDate = localStorage.getItem('daily_thought_date');
      const today = new Date().toDateString();

      if (stored && storedDate === today) {
        setDailyThought(stored);
      } else {
        const quotes = [
            '"Success is not final, failure is not fatal: it is the courage to continue that counts." – Winston Churchill',
            '"Happiness depends upon ourselves." – Aristotle',
            '"Fall seven times and stand up eight." – Japanese Proverb',
            '"The unexamined life is not worth living." – Socrates',
            '"Love is composed of a single soul inhabiting two bodies." – Aristotle',
            '"Creativity is intelligence having fun." – Albert Einstein',
            '"A leader is one who knows the way, goes the way, and shows the way." – John Maxwell',
            '"In every walk with nature one receives far more than he seeks." – John Muir',
            '"Do what you can, with what you have, where you are." – Theodore Roosevelt',
            '"The best way to predict the future is to create it." – Peter Drucker',
            '"It always seems impossible until it’s done." – Nelson Mandela',
            '"Happiness is not something ready made. It comes from your own actions." – Dalai Lama',
            '"What you get by achieving your goals is not as important as what you become by achieving your goals." – Zig Ziglar',
            '"The only true wisdom is in knowing you know nothing." – Socrates',
            '"Love all, trust a few, do wrong to none." – William Shakespeare',
            '"Imagination is more important than knowledge." – Albert Einstein',
            '"Leadership is not about being in charge. It is about taking care of those in your charge." – Simon Sinek',
            '"Look deep into nature, and then you will understand everything better." – Albert Einstein',
            '"Keep your face always toward the sunshine—and shadows will fall behind you." – Walt Whitman',
            '"Don’t count the days, make the days count." – Muhammad Ali',
            '"Act as if what you do makes a difference. It does." – William James',
            '"Happiness is when what you think, what you say, and what you do are in harmony." – Mahatma Gandhi',
            '"Hardships often prepare ordinary people for an extraordinary destiny." – C.S. Lewis',
            '"Knowing yourself is the beginning of all wisdom." – Aristotle',
            '"Love is the only force capable of transforming an enemy into a friend." – Martin Luther King Jr.',
            '"You can’t use up creativity. The more you use, the more you have." – Maya Angelou',
            '"Innovation distinguishes between a leader and a follower." – Steve Jobs',
            '"The earth has music for those who listen." – George Santayana',
            '"Positive anything is better than negative nothing." – Elbert Hubbard',
            '"Opportunities don’t happen. You create them." – Chris Grosser',
            '"Don’t watch the clock; do what it does. Keep going." – Sam Levenson',
            '"Happiness is not by chance, but by choice." – Jim Rohn',
            '"Strength does not come from physical capacity. It comes from an indomitable will." – Mahatma Gandhi',
            '"Wisdom begins in wonder." – Socrates',
            '"Love is the greatest refreshment in life." – Pablo Picasso',
            '"The true sign of intelligence is not knowledge but imagination." – Albert Einstein',
            '"The function of leadership is to produce more leaders, not more followers." – Ralph Nader',
            '"Adopt the pace of nature: her secret is patience." – Ralph Waldo Emerson',
            '"Keep your thoughts positive because your thoughts become your words." – Mahatma Gandhi',
            '"Dream big and dare to fail." – Norman Vaughan',
            '"Don’t be pushed around by the fears in your mind. Be led by the dreams in your heart." – Roy T. Bennett',
            '"Happiness is not having what you want. It is wanting what you have." – Unknown',
            '"Courage isn’t having the strength to go on—it is going on when you don’t have strength." – Napoleon Bonaparte',
            '"He who opens a school door, closes a prison." – Victor Hugo',
            '"Love is the flower you’ve got to let grow." – John Lennon',
            '"Every artist was first an amateur." – Ralph Waldo Emerson',
            '"Leadership is the capacity to translate vision into reality." – Warren Bennis',
            '"Nature does not hurry, yet everything is accomplished." – Lao Tzu',
            '"The more positive you are, the more resilient you become." – Unknown',
            '"Start where you are. Use what you have. Do what you can." – Arthur Ashe'
        ];
        // Select a random quote from the list
        const text = quotes[Math.floor(Math.random() * quotes.length)];
        setDailyThought(text);
        localStorage.setItem('daily_thought', text);
        localStorage.setItem('daily_thought_date', today);
      }
  }, []);

  const toggleTimer = () => setIsTimerActive(!isTimerActive);
  
  const resetTimer = () => {
      setIsTimerActive(false);
      setTimeLeft(timerMode === 'FOCUS' ? focusDuration * 60 : breakDuration * 60);
  };

  const switchTimerMode = (mode: 'FOCUS' | 'BREAK') => {
    setTimerMode(mode);
    setIsTimerActive(false);
    setTimeLeft(mode === 'FOCUS' ? focusDuration * 60 : breakDuration * 60);
  };

  const adjustDuration = (type: 'FOCUS' | 'BREAK', change: number) => {
    if (type === 'FOCUS') {
        setFocusDuration(prev => Math.max(1, Math.min(120, prev + change)));
    } else {
        setBreakDuration(prev => Math.max(1, Math.min(60, prev + change)));
    }
  };

  const saveTimerSettings = () => {
    localStorage.setItem('focus_duration', focusDuration.toString());
    localStorage.setItem('break_duration', breakDuration.toString());
    setIsEditingTimer(false);
    resetTimer();
  };

  const handleMoodSelect = (m: 'Happy' | 'Neutral' | 'Stressed') => {
    setMood(m);
    localStorage.setItem('daily_mood', m);
    localStorage.setItem('daily_mood_date', new Date().toDateString());
  };

  const resetMood = () => {
    setMood(null);
    localStorage.removeItem('daily_mood');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- Animation Variants ---
  const containerVariants: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
  
  // Calculate stroke dashoffset for the custom SVG wheel
  // Radius = 40, Circumference = 2 * PI * 40 ≈ 251.3
  const circleRadius = 40;
  const circumference = 2 * Math.PI * circleRadius;
  
  return (
    <motion.div className="space-y-8 pb-8" variants={containerVariants} initial="hidden" animate="show">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
        <div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-900 dark:text-white flex items-center gap-3">
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">{userName.split(' ')[0]}</span> <span className="text-4xl animate-pulse">👋</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-xl font-medium">
            Let's make today count.
          </p>
        </div>
        
        {/* Date Widget Pill */}
        <div className="flex items-center gap-5 bg-white dark:bg-zinc-900/50 backdrop-blur-xl px-8 py-4 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-black/20">
           <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-full text-indigo-600 dark:text-indigo-400">
             <Clock className="w-6 h-6" />
           </div>
           <div className="text-right">
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{dayStr}</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-white leading-none">{dateStr}</p>
           </div>
        </div>
      </div>

      {/* 2. Main Grid Layout (Bento Box) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         
         {/* Focus Mode - WHITE CARD (High Contrast) */}
         <motion.div 
            variants={itemVariants} 
            className="lg:col-span-1 bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl text-zinc-900 relative overflow-hidden flex flex-col min-h-[400px] group"
         >
             <AnimatePresence mode="wait">
                 {!isEditingTimer ? (
                   <motion.div 
                     key="timer"
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 20 }}
                     transition={{ duration: 0.2 }}
                     className="flex flex-col h-full justify-between z-10 relative"
                   >
                     <div className="flex justify-between items-start">
                        <div>
                           <h3 className="text-2xl font-black flex items-center gap-2 tracking-tight"><Zap className="w-6 h-6 text-amber-500 fill-amber-500" /> Focus</h3>
                           <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mt-1">Deep Work Session</p>
                        </div>
                        <button onClick={() => setIsEditingTimer(true)} className="p-2 text-zinc-300 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-all">
                           <Settings2 className="w-5 h-5" />
                        </button>
                     </div>

                     {/* Timer Mode Switcher */}
                     <div className="flex bg-zinc-100 p-1.5 rounded-2xl self-center w-full max-w-[200px] relative mt-4">
                        <motion.div 
                           className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm z-0"
                           initial={false}
                           animate={{ x: timerMode === 'BREAK' ? '100%' : '0%' }}
                           transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <button onClick={() => switchTimerMode('FOCUS')} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest z-10 relative transition-colors duration-200 ${timerMode === 'FOCUS' ? 'text-zinc-900' : 'text-zinc-400'}`}>Focus</button>
                        <button onClick={() => switchTimerMode('BREAK')} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest z-10 relative transition-colors duration-200 ${timerMode === 'BREAK' ? 'text-zinc-900' : 'text-zinc-400'}`}>Break</button>
                     </div>

                     <div className="flex justify-center items-center my-auto relative py-6">
                        <div className="text-[5.5rem] sm:text-[6rem] font-black tracking-tighter tabular-nums leading-none text-zinc-900">
                           {formatTime(timeLeft)}
                        </div>
                        {isTimerActive && (
                          <div className="absolute inset-0 rounded-full border-4 border-amber-500/10 animate-ping opacity-20 scale-150"></div>
                        )}
                     </div>

                     <div className="flex justify-center items-center gap-6">
                        <motion.button 
                           whileTap={{ scale: 0.9 }}
                           onClick={toggleTimer} 
                           className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-white transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 ${isTimerActive ? 'bg-zinc-900' : 'bg-zinc-900'}`}
                        >
                           {isTimerActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                        </motion.button>
                        <motion.button 
                           whileTap={{ scale: 0.9 }}
                           onClick={resetTimer} 
                           className="w-14 h-14 bg-zinc-100 rounded-[1.5rem] flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 transition-colors"
                        >
                           <RotateCcw className="w-6 h-6" />
                        </motion.button>
                     </div>
                   </motion.div>
                 ) : (
                   <motion.div 
                      key="settings"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col h-full z-10 relative"
                   >
                      <div className="flex justify-between items-center mb-6">
                         <div>
                            <h3 className="text-xl font-black text-zinc-900">Configure</h3>
                            <p className="text-zinc-400 text-xs font-bold uppercase tracking-wide">Timer Preferences</p>
                         </div>
                         <button onClick={saveTimerSettings} className="p-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors shadow-lg active:scale-95">
                            <Check className="w-5 h-5" />
                         </button>
                      </div>
                      
                      <div className="space-y-4 my-auto">
                          <div className="bg-zinc-50 p-5 rounded-[2rem] border border-zinc-100">
                              <div className="flex justify-between items-center mb-2">
                                  <span className="font-black text-zinc-900 text-sm">Focus Duration</span>
                                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">MINUTES</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                  <button onClick={() => adjustDuration('FOCUS', -5)} className="w-12 h-12 flex items-center justify-center bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-100 transition-colors text-zinc-600 active:scale-95 shadow-sm"><Minus className="w-5 h-5"/></button>
                                  <span className="text-4xl font-black tabular-nums text-zinc-900 w-20 text-center">{focusDuration}</span>
                                  <button onClick={() => adjustDuration('FOCUS', 5)} className="w-12 h-12 flex items-center justify-center bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-colors shadow-md active:scale-95"><Plus className="w-5 h-5"/></button>
                              </div>
                          </div>

                          <div className="bg-zinc-50 p-5 rounded-[2rem] border border-zinc-100">
                              <div className="flex justify-between items-center mb-2">
                                  <span className="font-black text-zinc-900 text-sm">Break Duration</span>
                                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">MINUTES</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                  <button onClick={() => adjustDuration('BREAK', -1)} className="w-12 h-12 flex items-center justify-center bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-100 transition-colors text-zinc-600 active:scale-95 shadow-sm"><Minus className="w-5 h-5"/></button>
                                  <span className="text-4xl font-black tabular-nums text-zinc-900 w-20 text-center">{breakDuration}</span>
                                  <button onClick={() => adjustDuration('BREAK', 1)} className="w-12 h-12 flex items-center justify-center bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-colors shadow-md active:scale-95"><Plus className="w-5 h-5"/></button>
                              </div>
                          </div>
                      </div>
                   </motion.div>
                 )}
             </AnimatePresence>
             
             {/* Decorative Elements */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-amber-200/40 to-orange-100/40 rounded-full blur-3xl pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>
         </motion.div>

         {/* Wellness Check */}
         <motion.div variants={itemVariants} className="bg-zinc-900 dark:bg-black rounded-[2.5rem] p-8 border border-zinc-200/5 dark:border-zinc-800 flex flex-col justify-between shadow-lg relative overflow-hidden group min-h-[300px]">
             {/* Dynamic Background */}
             <div className={`absolute inset-0 transition-colors duration-700 ${
                mood === 'Happy' ? 'bg-emerald-500/10' :
                mood === 'Stressed' ? 'bg-rose-500/10' :
                mood === 'Neutral' ? 'bg-amber-500/10' :
                'bg-gradient-to-br from-indigo-500/5 to-purple-500/5'
             }`}></div>
             
             <div className="relative z-10 flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {mood ? (
                            mood === 'Happy' ? <Zap className="w-5 h-5 text-emerald-400" /> :
                            mood === 'Stressed' ? <Wind className="w-5 h-5 text-rose-400" /> :
                            <TrendingUp className="w-5 h-5 text-amber-400" />
                        ) : (
                            <Brain className="w-5 h-5 text-indigo-400" />
                        )}
                        {mood ? 'Mood Check' : 'Wellness'}
                    </h3>
                    <p className="text-zinc-500 text-sm mt-1 font-medium">
                        {mood ? 'Today\'s Status' : 'Mental energy check-in'}
                    </p>
                </div>
                {mood && (
                     <button onClick={resetMood} className="p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
                         <RotateCcw className="w-4 h-4" />
                     </button>
                )}
             </div>
             
             <AnimatePresence mode="wait">
                 {!mood ? (
                    <motion.div 
                        key="selection"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col flex-1 relative z-10"
                    >
                         <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full"></div>
                                <div className="relative w-20 h-20 bg-zinc-800/50 rounded-full border border-zinc-700/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <Brain className="w-8 h-8 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                                </div>
                                {/* Decorative pulsing ring */}
                                <div className="absolute inset-[-10px] rounded-full border border-dashed border-zinc-800/50 animate-[spin_10s_linear_infinite]"></div>
                            </div>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">How are you feeling today?</p>
                         </div>

                         <div className="flex justify-between gap-3 mt-auto">
                             {[
                               { icon: Smile, label: 'Happy', color: 'emerald', value: 'Happy' },
                               { icon: Meh, label: 'Neutral', color: 'amber', value: 'Neutral' },
                               { icon: Frown, label: 'Stressed', color: 'rose', value: 'Stressed' }
                             ].map((item) => (
                               <motion.button 
                                  key={item.label}
                                  onClick={() => handleMoodSelect(item.value as any)}
                                  whileHover={{ y: -5 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`flex-1 aspect-[4/5] bg-zinc-800/40 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-zinc-800 transition-all border border-transparent hover:border-${item.color}-500/30 group/btn`}
                               >
                                  <item.icon className={`w-8 h-8 text-${item.color}-500 transition-transform duration-300 group-hover/btn:scale-110`} strokeWidth={1.5} />
                                  <span className={`text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover/btn:text-${item.color}-400`}>{item.label}</span>
                               </motion.button>
                             ))}
                         </div>
                    </motion.div>
                 ) : (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex-1 flex flex-col items-center justify-center text-center relative z-10"
                    >
                        {mood === 'Stressed' && (
                            <div className="relative mb-6">
                                <motion.div 
                                   animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                   className="w-32 h-32 rounded-full bg-rose-500 blur-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                />
                                <motion.div 
                                   animate={{ scale: [1, 1.1, 1], borderColor: ["rgba(244,63,94,0.2)", "rgba(244,63,94,0.6)", "rgba(244,63,94,0.2)"] }}
                                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                   className="w-24 h-24 rounded-full border-2 border-rose-500/30 flex items-center justify-center relative z-10 bg-zinc-900/50 backdrop-blur-sm"
                                >
                                   <Wind className="w-8 h-8 text-rose-500" />
                                </motion.div>
                            </div>
                        )}
                        
                        {mood === 'Happy' && (
                            <motion.div 
                               initial={{ scale: 0 }} animate={{ scale: 1 }} 
                               className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20"
                            >
                                <Zap className="w-10 h-10 text-emerald-500 fill-emerald-500" />
                            </motion.div>
                        )}

                        {mood === 'Neutral' && (
                            <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20">
                                <TrendingUp className="w-10 h-10 text-amber-500" />
                            </div>
                        )}

                        <h4 className="text-2xl font-black text-white mb-2">
                            {mood === 'Happy' ? 'High Energy!' : mood === 'Stressed' ? 'Breathe Deep' : 'Balanced State'}
                        </h4>
                        <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-[200px]">
                            {mood === 'Happy' ? "You're crushing it! Use this momentum to tackle your toughest subject now." : 
                             mood === 'Stressed' ? "Inhale slowly... hold... and exhale. Let the tension fade away." : 
                             "Steady progress is better than no progress. Keep consistent."}
                        </p>
                    </motion.div>
                 )}
             </AnimatePresence>
         </motion.div>

         {/* Streak Card */}
         <motion.div variants={itemVariants} className="bg-zinc-900 dark:bg-black rounded-[2.5rem] p-8 border border-zinc-200/5 dark:border-zinc-800 flex flex-col justify-between relative overflow-hidden group">
             <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4">
                       <motion.div
                         animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                         transition={{ duration: 2, repeat: Infinity }}
                       >
                         <Flame className="w-7 h-7 text-orange-500 fill-orange-500" />
                       </motion.div>
                    </div>
                </div>
                <h3 className="text-xl font-bold text-white">Current Streak</h3>
                <div className="flex items-baseline gap-2 mt-2">
                   <span className="text-6xl font-black text-white tracking-tighter">12</span>
                   <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">DAYS</span>
                </div>
             </div>
             
             <div className="relative z-10 mt-6">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                   <span>Goal: 14 Days</span>
                   <span className="text-orange-400">85%</span>
                </div>
                <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "85%" }}
                     transition={{ duration: 1.5, delay: 0.5 }}
                     className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full"
                   />
                </div>
             </div>
             
             {/* Ambient Effect */}
             <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl group-hover:bg-orange-600/20 transition-colors duration-500"></div>
         </motion.div>

         {/* Row 2 */}

         {/* Attendance Card with Breakdown */}
         <motion.div 
            variants={itemVariants} 
            className="lg:col-span-2 bg-zinc-900 dark:bg-black rounded-[2.5rem] p-8 border border-zinc-200/5 dark:border-zinc-800 flex flex-col md:flex-row gap-8 relative overflow-hidden group cursor-pointer shadow-xl" 
            onClick={() => setView(View.ATTENDANCE)}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
         >
             {/* Dynamic Gradient Background based on attendance */}
             <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-500 opacity-20 ${avgAttendance >= 75 ? 'from-emerald-500/20 via-teal-500/5' : 'from-rose-500/20 via-orange-500/5'} to-transparent`}></div>

             {/* Left: Circular Stats (Custom SVG) */}
             <div className="flex-shrink-0 flex flex-col items-center justify-center relative z-10 min-w-[220px] border-b md:border-b-0 md:border-r border-zinc-800 pb-8 md:pb-0 md:pr-10">
                  <div className="flex justify-between w-full mb-2 md:hidden">
                     <h3 className="text-xl font-bold text-white">Attendance</h3>
                     <div className="p-2 bg-zinc-800 rounded-lg"><ArrowRight className="w-4 h-4 text-zinc-400" /></div>
                  </div>

                  {/* Custom Progress Ring */}
                  <div className="relative w-48 h-48 flex items-center justify-center">
                      {/* Glowing drop shadow behind the ring */}
                      <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 ${avgAttendance >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      
                      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                         {/* Track */}
                         <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-zinc-800/50" />
                         
                         {/* Progress */}
                         <motion.circle 
                             initial={{ pathLength: 0 }}
                             animate={{ pathLength: avgAttendance / 100 }}
                             transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                             cx="50" cy="50" r="40" 
                             fill="transparent" 
                             stroke="currentColor" 
                             strokeWidth="6" 
                             strokeLinecap="round"
                             className={`${avgAttendance >= 75 ? 'text-emerald-500' : 'text-rose-500'} drop-shadow-md`}
                         />
                      </svg>
                      
                      {/* Center Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className={`text-5xl font-black tracking-tighter ${avgAttendance >= 75 ? 'text-white' : 'text-rose-500'}`}>
                             {avgAttendance}%
                          </span>
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Average</span>
                      </div>
                  </div>

                  <div className={`mt-4 px-4 py-2 rounded-xl border flex items-center gap-2 ${avgAttendance >= 75 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                      {avgAttendance >= 75 ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                      <span className="text-xs font-bold uppercase tracking-wide">{avgAttendance >= 75 ? 'Safe Zone' : 'At Risk'}</span>
                  </div>
             </div>
             
             {/* Right: Breakdown List */}
             <div className="flex-1 w-full relative z-10 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-5">
                   <h3 className="text-xl font-bold text-white hidden md:block">Subject Breakdown</h3>
                   {avgAttendance < 75 && (
                       <div className="flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                           <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Attention Needed</span>
                       </div>
                   )}
                </div>

                <div className="space-y-4">
                   {subjectPerformance.slice(0, 3).map((sub, idx) => (
                      <div key={sub.id} className="group/item">
                         <div className="flex justify-between items-end mb-1.5">
                            <span className="text-sm font-bold text-zinc-300 group-hover/item:text-white transition-colors truncate max-w-[150px]">{sub.name}</span>
                            <span className={`text-xs font-black ${sub.percentage < 75 ? 'text-rose-500' : 'text-emerald-500'}`}>{sub.percentage}%</span>
                         </div>
                         <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${sub.percentage}%` }}
                               transition={{ duration: 1, delay: 0.2 + (idx * 0.1) }}
                               className={`h-full rounded-full ${sub.percentage < 75 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            />
                         </div>
                      </div>
                   ))}
                   {subjectPerformance.length > 3 && (
                      <div className="text-center pt-2">
                         <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors">+ {subjectPerformance.length - 3} More Subjects</span>
                      </div>
                   )}
                </div>
             </div>
         </motion.div>

         {/* Tasks List */}
         <motion.div variants={itemVariants} className="bg-zinc-900 dark:bg-black rounded-[2.5rem] p-8 border border-zinc-200/5 dark:border-zinc-800 flex flex-col shadow-lg">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Priority Tasks</h3>
                <button onClick={() => setView(View.TASKS)} className="text-[10px] font-bold bg-violet-500/10 text-violet-400 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-violet-500/20 transition-colors">View All</button>
             </div>
             
             <div className="space-y-3 flex-1">
                 {upcomingTasks.map(task => (
                    <motion.div 
                       key={task.id} 
                       whileHover={{ x: 5 }}
                       className="p-4 bg-zinc-800/40 border border-zinc-800 rounded-2xl flex items-center gap-4 hover:bg-zinc-800 transition-colors cursor-pointer group"
                    >
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${task.isHighPriority ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          <Target className="w-5 h-5" />
                       </div>
                       <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-white text-sm truncate group-hover:text-violet-300 transition-colors">{task.title}</h4>
                          <p className="text-xs text-zinc-500 mt-0.5 font-medium">Due {new Date(task.dueDate).toLocaleDateString()}</p>
                       </div>
                       {task.isHighPriority && <div className="w-2 h-2 bg-rose-500 rounded-full"></div>}
                    </motion.div>
                 ))}
                 {upcomingTasks.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 bg-zinc-800/20 rounded-2xl border border-dashed border-zinc-800">
                       <Sparkles className="w-8 h-8 mb-2 opacity-30" />
                       <p className="text-xs font-bold uppercase tracking-wider">No pending tasks</p>
                    </div>
                 )}
             </div>
         </motion.div>

      </div>
      
      {/* Mentor's Insight (Footer) */}
      <motion.div variants={itemVariants} className="mt-8 bg-zinc-900 dark:bg-zinc-950 border border-zinc-200/5 dark:border-zinc-800 p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          {/* Subtle light effect */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500"></div>
          
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
             <Lightbulb className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="flex-1 text-center md:text-left">
             <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-2">Daily Stoic Insight</h4>
             <p className="text-lg md:text-xl font-medium text-zinc-300 leading-relaxed">{dailyThought || "Loading insight..."}</p>
          </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
