import React, { useState } from 'react';
import { Resource } from '../types';
import { FileText, Video, Link as LinkIcon, Download, Search, ExternalLink, PlayCircle } from 'lucide-react';

interface ResourcesProps {
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
}

const Resources: React.FC<ResourcesProps> = ({ resources }) => {
  const [filter, setFilter] = useState<'ALL' | 'PDF' | 'VIDEO' | 'LINK'>('ALL');

  const filteredResources = filter === 'ALL' ? resources : resources.filter(r => r.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-6 h-6 text-rose-500" />;
      case 'VIDEO': return <Video className="w-6 h-6 text-indigo-500" />;
      case 'LINK': return <LinkIcon className="w-6 h-6 text-emerald-500" />;
      default: return <FileText className="w-6 h-6 text-slate-500" />;
    }
  };

  const getActionIcon = (type: string) => {
     switch (type) {
        case 'PDF': return <Download className="w-4 h-4" />;
        case 'VIDEO': return <PlayCircle className="w-4 h-4" />;
        case 'LINK': return <ExternalLink className="w-4 h-4" />;
        default: return <Download className="w-4 h-4" />;
     }
  };

  const getActionText = (type: string) => {
      switch (type) {
         case 'PDF': return 'Download';
         case 'VIDEO': return 'Watch Now';
         case 'LINK': return 'Visit Link';
         default: return 'Open';
      }
   };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Academic Resources</h2>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Access lecture notes, recordings, and external references.</p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search resources..." 
            className="w-full md:w-64 pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['ALL', 'PDF', 'VIDEO', 'LINK'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type as any)}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filter === type
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res, idx) => (
          <div 
             key={res.id} 
             className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
             style={{ animationDelay: `${idx * 100}ms` }}
          >
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

            <div className="relative z-10">
               <div className="flex justify-between items-start mb-6">
                 <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
                   {getIcon(res.type)}
                 </div>
                 <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md uppercase tracking-wider">
                   {res.type}
                 </span>
               </div>
               
               <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{res.title}</h3>
               <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">
                 Shared by Prof. Anderson for the Advanced Algorithms module. This contains critical revision material.
               </p>
               
               <button className="w-full py-3 bg-slate-50 dark:bg-slate-900/50 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-slate-600 dark:text-slate-300 hover:text-white dark:hover:text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group/btn">
                 <span className="group-hover/btn:scale-110 transition-transform">
                    {getActionIcon(res.type)}
                 </span>
                 {getActionText(res.type)}
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resources;