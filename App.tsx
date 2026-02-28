
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Attendance from './components/Attendance';
import Timetable from './components/Timetable';
import Calendar from './components/Calendar';
import Tasks from './components/Tasks';
import Grades from './components/Grades';
import Groups from './components/Groups';
import Settings from './components/Settings';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import { useStore } from './store';
import { View, Subject } from './types';
// Casting motion to any to avoid "Property does not exist" errors in this environment
import { motion as m, AnimatePresence } from 'framer-motion';
const motion = m as any;
import { Menu } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('is_authenticated') === 'true';
  });

  const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('has_onboarded') === 'true';
  });

  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  // DEFAULT TO DARK MODE (True) for better focus/psychology
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const store = useStore();

  useEffect(() => {
    // Check local storage for theme preference, otherwise default to dark
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setIsDark(storedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('is_authenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('is_authenticated');
  };
  
  const handleResetApp = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace(window.location.origin + window.location.pathname);
  };

  const handleOnboardingComplete = (name: string, university: string, major: string, subjects: Subject[]) => {
    store.setUserName(name);
    store.setUniversity(university);
    store.setCourse(major);
    if (subjects.length > 0) {
        store.setSubjects(subjects);
    }
    setHasOnboarded(true);
    localStorage.setItem('has_onboarded', 'true');
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard 
          subjects={store.subjects} 
          tasks={store.tasks} 
          timetable={store.timetable} 
          userName={store.userName}
          setView={setCurrentView}
        />;
      case View.ATTENDANCE:
        return <Attendance subjects={store.subjects} setSubjects={store.setSubjects} />;
      case View.TIMETABLE:
        return <Timetable timetable={store.timetable} setTimetable={store.setTimetable} />;
      case View.CALENDAR:
        return <Calendar tasks={store.tasks} events={store.events} setEvents={store.setEvents} />;
      case View.TASKS:
        return <Tasks tasks={store.tasks} setTasks={store.setTasks} />;
      case View.GRADES:
        return <Grades semesters={store.semesters} setSemesters={store.setSemesters} />;
      case View.GROUPS:
        return <Groups 
            messages={store.messages} 
            setMessages={store.setMessages} 
            groups={store.groups}
            setGroups={store.setGroups}
        />;
      case View.SETTINGS:
        return <Settings 
          userName={store.userName} setUserName={store.setUserName}
          university={store.university} setUniversity={store.setUniversity}
          course={store.course} setCourse={store.setCourse}
          subjects={store.subjects} setSubjects={store.setSubjects}
          resetApp={handleResetApp}
        />;
      default:
        return <Dashboard 
          subjects={store.subjects} 
          tasks={store.tasks} 
          timetable={store.timetable} 
          userName={store.userName}
          setView={setCurrentView}
        />;
    }
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  if (!hasOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black transition-colors duration-500 overflow-hidden font-sans selection:bg-orange-500/30 selection:text-orange-900 dark:selection:text-orange-100">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Static Background Image */}
          <div className="absolute inset-0 bg-zinc-50 dark:bg-[#09090b]" />
          <img 
             src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
             alt="Background"
             className="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-20 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-black/40 dark:via-transparent dark:to-transparent" />
      </div>
      
      <div className="z-10 flex h-full w-full relative">
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" 
              onClick={() => setIsSidebarOpen(false)} 
            />
          )}
        </AnimatePresence>

        <Sidebar 
          currentView={currentView} 
          setView={(view) => { setCurrentView(view); setIsSidebarOpen(false); }} 
          isDark={isDark} 
          toggleTheme={toggleTheme} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onLogout={handleLogout} 
          userName={store.userName} 
        />

        <main className="flex-1 overflow-auto relative custom-scrollbar flex flex-col">
          {/* Mobile Header */}
          <header className="md:hidden sticky top-0 z-30 w-full p-4 flex items-center justify-between bg-zinc-50/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 active:scale-95 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center">
              <span className="font-black text-2xl text-zinc-900 dark:text-white tracking-tighter">FORUS</span>
            </div>
            <div className="w-10"></div>
          </header>

          <div className="p-4 sm:p-6 md:px-10 md:py-10 max-w-[1600px] mx-auto min-h-full w-full">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentView} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                transition={{ duration: 0.3, ease: "easeOut" }} 
                className="h-full"
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
