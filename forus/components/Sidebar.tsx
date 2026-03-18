
import React from 'react';
import { View } from '../types';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  CalendarDays, 
  ListTodo, 
  Calculator, 
  Users, 
  LogOut,
  Moon,
  Sun,
  X,
  Calendar,
  Settings
} from 'lucide-react';
// Casting motion to any to avoid "Property does not exist" errors in this specific TypeScript environment
import { motion as m, LayoutGroup } from 'framer-motion';
const motion = m as any;

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  isDark: boolean;
  toggleTheme: () => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  userName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isDark, toggleTheme, isOpen, onClose, onLogout, userName }) => {
  
  const menuItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: View.ATTENDANCE, label: 'Attendance', icon: CheckCircle2 },
    { id: View.TIMETABLE, label: 'Timetable', icon: CalendarDays },
    { id: View.CALENDAR, label: 'Calendar', icon: Calendar },
    { id: View.TASKS, label: 'Tasks', icon: ListTodo },
    { id: View.GRADES, label: 'Grades', icon: Calculator },
    { id: View.GROUPS, label: 'Groups', icon: Users },
    { id: View.SETTINGS, label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white/60 dark:bg-black/60 backdrop-blur-2xl flex flex-col h-full flex-shrink-0 border-r border-zinc-200/50 dark:border-zinc-800/50 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
      <div className="p-8 pb-6 flex justify-between items-start">
        <div className="flex items-center gap-3 group cursor-pointer">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: -3 }}
            className="w-12 h-12 bg-[#FF5722] flex items-center justify-center text-white shadow-lg shadow-orange-500/20"
            style={{ borderRadius: '45% 55% 70% 30% / 30% 30% 70% 70%' }}
          >
             <span className="font-black text-[10px] tracking-tight">FORUS</span>
          </motion.div>
          <div className="flex flex-col justify-center">
            <span className="font-black text-3xl text-zinc-900 dark:text-white tracking-tighter leading-none">FORUS</span>
          </div>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={onClose} 
          className="md:hidden p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="px-6 mb-2">
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider pl-3 mb-2">Overview</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar pb-6">
        <LayoutGroup>
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`relative w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold rounded-2xl transition-colors duration-200 group outline-none ${
                  isActive 
                    ? 'text-white dark:text-zinc-900' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-zinc-900 dark:bg-white rounded-2xl shadow-md shadow-zinc-200 dark:shadow-zinc-900/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3.5">
                  <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white dark:text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`} />
                  {item.label}
                </span>
              </button>
            );
          })}
        </LayoutGroup>
      </nav>

      {/* Profile Card */}
      <div className="p-4 mt-auto">
        <div className="p-5 rounded-[1.5rem] bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm relative overflow-hidden group backdrop-blur-sm">
          
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>

          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-5 relative z-10">
             <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 font-bold text-xl">
               {userName.charAt(0)}
             </div>

             {/* Name & Major */}
             <div className="flex flex-col min-w-0">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight truncate">{userName || 'Student'}</h3>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">Student</p>
             </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 relative z-10">
             <button 
               onClick={toggleTheme}
               className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold transition-all hover:text-zinc-900 dark:hover:text-white group/btn hover:border-zinc-300 dark:hover:border-zinc-600"
             >
               {isDark ? <Sun className="w-3.5 h-3.5 group-hover/btn:rotate-90 transition-transform" /> : <Moon className="w-3.5 h-3.5 group-hover/btn:-rotate-12 transition-transform" />}
               {isDark ? 'Light' : 'Dark'}
             </button>
             
             <button 
               onClick={onLogout}
               className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-rose-500/50 hover:bg-rose-50 dark:hover:bg-rose-900/10 text-rose-500 text-xs font-bold transition-all hover:text-rose-600 dark:hover:text-rose-400"
             >
               <LogOut className="w-3.5 h-3.5" />
               Logout
             </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
