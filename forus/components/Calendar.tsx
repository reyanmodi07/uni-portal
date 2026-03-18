
import React, { useState } from 'react';
import { Task, CalendarEvent } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, GraduationCap, Cake, Palmtree, Star, Trash2 } from 'lucide-react';
// Casting motion to any
import { motion as m, AnimatePresence } from 'framer-motion';
const motion = m as any;

interface CalendarProps {
  tasks: Task[];
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
}

const Calendar: React.FC<CalendarProps> = ({ tasks, events, setEvents }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventType, setNewEventType] = useState<CalendarEvent['type']>('OTHER');

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptySlots = Array.from({ length: firstDay }, (_, i) => i);
  
  // Calculate remaining slots to complete the last week row
  const totalSlotsUsed = daysInMonth + firstDay;
  const remainingSlots = Math.ceil(totalSlotsUsed / 7) * 7 - totalSlotsUsed;

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getTasksForDate = (day: number) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === day &&
        taskDate.getMonth() === currentDate.getMonth() &&
        taskDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const getEventsForDate = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;

    const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: newEventTitle,
        date: newEventDate,
        type: newEventType
    };

    setEvents(prev => [...prev, newEvent]);
    setNewEventTitle('');
    setIsModalOpen(false);
  };

  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this event?')) {
        setEvents(prev => prev.filter(ev => ev.id !== id));
    }
  };

  const getEventStyle = (type: CalendarEvent['type']) => {
      switch (type) {
          case 'EXAM': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800';
          case 'BIRTHDAY': return 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800';
          case 'HOLIDAY': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
          default: return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      }
  };

  const getEventIcon = (type: CalendarEvent['type']) => {
      switch (type) {
          case 'EXAM': return <GraduationCap className="w-3 h-3" />;
          case 'BIRTHDAY': return <Cake className="w-3 h-3" />;
          case 'HOLIDAY': return <Palmtree className="w-3 h-3" />;
          default: return <Star className="w-3 h-3" />;
      }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col gap-2">
           <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white flex items-center gap-3">
             <CalendarIcon className="w-10 h-10 text-violet-500" />
             Calendar
           </h2>
           <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">Organize your academic life.</p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="flex items-center bg-white dark:bg-zinc-900 rounded-2xl p-1.5 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <button onClick={prevMonth} className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-600 dark:text-zinc-300">
                <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-40 text-center font-black text-sm text-zinc-900 dark:text-white uppercase tracking-wider">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
            <button onClick={nextMonth} className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-600 dark:text-zinc-300">
                <ChevronRight className="w-5 h-5" />
            </button>
            </div>
            
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 p-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
                <Plus className="w-5 h-5" />
            </button>
        </div>
      </div>

      <motion.div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none flex-1 flex flex-col overflow-hidden">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex-shrink-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-6 text-center text-xs font-black uppercase tracking-widest text-zinc-400">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid - Added overflow-y-auto to fix clipping */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto custom-scrollbar">
          {/* Empty Slots Previous Month */}
          {emptySlots.map(slot => (
            <div key={`empty-${slot}`} className="bg-zinc-50/30 dark:bg-zinc-900/30 border-b border-r border-zinc-100 dark:border-zinc-800/50 min-h-[100px]"></div>
          ))}

          {/* Actual Days */}
          {daysArray.map(day => {
            const dayTasks = getTasksForDate(day);
            const dayEvents = getEventsForDate(day);
            const today = isToday(day);
            
            return (
              <div 
                key={day} 
                className={`border-b border-r border-zinc-100 dark:border-zinc-800 p-2 sm:p-4 min-h-[100px] relative group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors ${
                  today ? 'bg-violet-50/30 dark:bg-violet-900/10' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-base font-bold w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                    today 
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-none scale-110' 
                      : 'text-zinc-700 dark:text-zinc-300 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700'
                  }`}>
                    {day}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 overflow-y-auto max-h-[80px] custom-scrollbar">
                  {/* Events */}
                  {dayEvents.map(event => (
                    <motion.div 
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border flex items-center justify-between gap-1 group/event ${getEventStyle(event.type)}`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                          {getEventIcon(event.type)}
                          <span className="truncate">{event.title}</span>
                      </div>
                      <button onClick={(e) => handleDeleteEvent(event.id, e)} className="opacity-0 group-hover/event:opacity-100 hover:text-rose-600 transition-opacity">
                          <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}

                  {/* Tasks */}
                  {dayTasks.map(task => (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border truncate cursor-pointer uppercase tracking-wider ${
                        task.completed
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 line-through border-transparent'
                          : task.isHighPriority 
                            ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-800'
                            : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800'
                      }`}
                      title={task.title}
                    >
                      {task.title}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {/* Fill remaining cells if needed - Optimized to only fill current week */}
          {Array.from({ length: remainingSlots }).map((_, i) => (
             <div key={`next-empty-${i}`} className="bg-zinc-50/30 dark:bg-zinc-900/30 border-b border-r border-zinc-100 dark:border-zinc-800/50 min-h-[100px]"></div>
          ))}
        </div>
      </motion.div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 w-full max-w-md shadow-2xl border border-zinc-200 dark:border-zinc-800"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Add Event</h3>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                <form onSubmit={handleAddEvent} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Event Title</label>
                        <input 
                            type="text" 
                            value={newEventTitle}
                            onChange={e => setNewEventTitle(e.target.value)}
                            className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white font-bold"
                            placeholder="e.g. Physics Midterm"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Date</label>
                        <input 
                            type="date" 
                            value={newEventDate}
                            onChange={e => setNewEventDate(e.target.value)}
                            className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white font-bold"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            {(['EXAM', 'BIRTHDAY', 'HOLIDAY', 'OTHER'] as const).map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setNewEventType(type)}
                                    className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                                        newEventType === type 
                                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent shadow-lg' 
                                            : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                                    }`}
                                >
                                    {getEventIcon(type)}
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            className="w-full py-5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" /> Add to Calendar
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Calendar;
