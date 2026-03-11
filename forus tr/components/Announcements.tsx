
import React from 'react';
import { Announcement } from '../types';
import { Megaphone, Calendar } from 'lucide-react';
// Casting motion to any
import { motion as m } from 'framer-motion';
const motion = m as any;

interface AnnouncementsProps {
  announcements: Announcement[];
}

const Announcements: React.FC<AnnouncementsProps> = ({ announcements }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
         <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white flex items-center gap-4">
           <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-200 dark:border-indigo-800">
              <Megaphone className="w-7 h-7" />
           </div>
           News Board
         </h2>
         <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">Latest updates from the campus.</p>
      </div>

      <div className="grid gap-6">
        {announcements.map(ann => (
          <motion.div variants={itemVariants} key={ann.id} className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all hover:border-indigo-300 dark:hover:border-indigo-800">
            {/* Decorative strip */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-500 group-hover:w-3 transition-all"></div>
            
            <div className="pl-4">
                <div className="flex justify-between items-start mb-4">
                   <span className="inline-block px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-widest rounded-lg">
                      {ann.author}
                   </span>
                   <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider bg-zinc-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(ann.date).toLocaleDateString()}
                   </div>
                </div>
                
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{ann.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-300 text-base leading-relaxed">{ann.content}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Announcements;
