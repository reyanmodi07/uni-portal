import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithCustomToken,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  query, 
  orderBy,
  setDoc,
  getDoc,
  deleteDoc,
  where,
  writeBatch,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Users, 
  FileText, 
  Bell, 
  Plus, 
  MessageSquare, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock,
  Menu,
  X,
  GraduationCap,
  School,
  BookOpen,
  CheckSquare,
  Trash2,
  Paperclip,
  File,
  ChevronRight,
  AlertCircle,
  User,
  AlertTriangle,
  Link as LinkIcon,
  Copy,
  Check,
  Settings,
  ExternalLink,
  Video,
  FileText as FileIcon,
  Download,
  MoreVertical,
  Zap,
  Edit2,
  Filter,
  Flag,
  LogOut,
  ArrowRight,
  Calendar,
  ChevronDown,
  LogOut as LeaveIcon,
  BarChart2,
  Pin,
  Search,
  Book,
  Hash,
  CalendarRange,
  Calculator,
  Moon,
  Sun,
  Activity,
  Layers
} from 'lucide-react';

// --- Firebase Configuration & Initialization ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'student-portal-v2';

// --- Constants ---
const UNIVERSITY_DATA = {
  "Ahmedabad University": [
    {
      category: "Engineering & Technology",
      courses: [
        "Chemical and Environmental Engineering",
        "Computer Science",
        "Computer Science and Engineering",
        "Electrical and Electronics Engineering",
        "Engineering Physics",
        "Mechanical Engineering"
      ]
    },
    {
      category: "Business & Management",
      courses: [
        "Accounting",
        "Accounting and Finance",
        "Business Analytics",
        "Family Business and Entrepreneurship",
        "Finance",
        "Finance and Economics",
        "Human Resource and Organisations",
        "Marketing",
        "Operations Management"
      ]
    },
    {
      category: "Sciences & Mathematics",
      courses: [
        "Life Sciences",
        "Mathematical and Computational Sciences",
        "Operations Research and Statistics"
      ]
    },
    {
      category: "Arts, Humanities & Social Sciences",
      courses: [
        "Economics",
        "History",
        "Integrated Arts (Performing Arts / Visual Arts)",
        "Philosophy, History and Languages",
        "Social and Political Sciences"
      ]
    }
  ]
};

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const GRADE_POINTS = {
  'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0
};

// --- Styles (Clean Material Theme) ---
const matCard = "bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6";
const matInput = "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl hover:border-indigo-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400";
const matBtnPrimary = "bg-indigo-600 text-white rounded-xl px-6 py-2.5 font-bold hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer";
const matBtnSecondary = "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl px-4 py-2.5 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center justify-center gap-2 cursor-pointer";
const matBtnGhost = "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl px-4 py-2.5 font-medium transition-all flex items-center gap-2 cursor-pointer";
const matIconBtn = "p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer";

// --- Utility Functions ---
const getResourceIcon = (type) => {
  switch(type) {
    case 'pdf': return <FileIcon className="text-rose-500" size={24} />;
    case 'video': return <Video className="text-blue-500" size={24} />;
    default: return <ExternalLink className="text-emerald-500" size={24} />;
  }
};

const sortByDateDesc = (a, b) => {
  const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(0);
  const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(0);
  return dateB - dateA;
};

const sortByDateAsc = (a, b) => {
  const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(0);
  const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(0);
  return dateA - dateB;
};

// Safe date formatter
const formatDate = (timestamp) => {
  if (!timestamp || !timestamp.seconds) return 'Just now';
  return new Date(timestamp.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// --- Components ---

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`
            flex items-center gap-3 rounded-xl pl-4 pr-6 py-4 shadow-xl animate-in slide-in-from-right-full border
            ${toast.type === 'error' 
              ? 'bg-white dark:bg-slate-800 border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400' 
              : 'bg-slate-900 dark:bg-slate-950 border-slate-800 dark:border-slate-800 text-white'}
          `}
        >
          {toast.type === 'success' ? <CheckCircle size={20} className="text-emerald-400" /> : null}
          {toast.type === 'error' ? <AlertCircle size={20} /> : null}
          <p className="text-sm font-medium">{toast.message}</p>
          <button onClick={() => removeToast(toast.id)} className="ml-auto opacity-70 hover:opacity-100">
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

const LoginScreen = ({ onLogin, isLoggingIn }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-100">
        <div className="bg-[#0F172A] p-10 text-center text-white">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">UniPortal</h1>
          <p className="mt-2 text-indigo-200 text-sm font-medium tracking-wide uppercase">Student Portal v2.5</p>
        </div>
        
        <div className="p-10">
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-900">Welcome Student</h2>
              <p className="text-slate-500 mt-1">Access your academic dashboard</p>
            </div>
            
            <button 
              onClick={onLogin}
              disabled={isLoggingIn}
              className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-indigo-600 px-6 py-4 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-70"
            >
              {isLoggingIn ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Enter Portal 
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Onboarding = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({ name: '', university: 'Ahmedabad University', course: '', semester: '' });
  const [subjects, setSubjects] = useState([{ id: Date.now(), name: '', totalClasses: 40 }]);
  const [loading, setLoading] = useState(false);

  const handleAddSubject = () => {
    setSubjects([...subjects, { id: Date.now(), name: '', totalClasses: 40 }]);
  };

  const handleRemoveSubject = (id) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const handleSubjectChange = (id, field, value) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const currentCourses = UNIVERSITY_DATA[profile.university] || [];

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main');
      batch.set(profileRef, { ...profile, onboarded: true, theme: 'light' }); 
      subjects.forEach(sub => {
        if (sub.name.trim()) {
          const subRef = doc(db, 'artifacts', appId, 'users', user.uid, 'subjects', sub.id.toString());
          batch.set(subRef, {
            name: sub.name,
            totalClasses: parseInt(sub.totalClasses) || 40,
            attended: 0,
            leavesTaken: 0,
            createdAt: serverTimestamp()
          });
        }
      });
      await batch.commit();
      onComplete();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl border border-slate-100">
        
        <div className="mb-8 flex items-center justify-between px-1">
           <div className="flex gap-2">
             <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
             <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
           </div>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step {step} of 2</span>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            {step === 1 ? 'Build Your Profile' : 'Setup Your Subjects'}
          </h1>
          <p className="mt-1 text-slate-500 text-sm">
            {step === 1 ? 'Let us know who you are and what you study.' : 'Add the subjects you are attending this semester.'}
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
             <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  placeholder="e.g. Alex Johnson"
                />
              </div>
            </div>
            
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">University</label>
              <div className="relative group">
                <School className="absolute left-4 top-3.5 text-slate-400 pointer-events-none" size={20} />
                <select 
                  value={profile.university}
                  onChange={e => setProfile({...profile, university: e.target.value, course: ''})}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-10 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
                >
                  {Object.keys(UNIVERSITY_DATA).map(uniName => (
                    <option key={uniName} value={uniName}>{uniName}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>
            
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Course / Major</label>
              <div className="relative group">
                <BookOpen className="absolute left-4 top-3.5 text-slate-400 pointer-events-none" size={20} />
                <select 
                  value={profile.course}
                  onChange={e => setProfile({...profile, course: e.target.value})}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-10 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
                  disabled={!profile.university}
                >
                  <option value="" disabled>Select your Major</option>
                  {currentCourses.map((category) => (
                    <optgroup key={category.category} label={category.category}>
                      {category.courses.map((course) => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>
            
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Current Semester</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-3.5 text-slate-400 pointer-events-none" size={20} />
                <select 
                  value={profile.semester}
                  onChange={e => setProfile({...profile, semester: e.target.value})}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-10 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
                >
                  <option value="" disabled>Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={`Semester ${sem}`}>Semester {sem}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={() => setStep(2)}
                disabled={!profile.name || !profile.course || !profile.semester}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
              >
                Continue <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="max-h-[300px] overflow-y-auto pr-2 -mr-2 space-y-3 custom-scrollbar p-1">
              {subjects.map((sub, index) => (
                <div key={sub.id} className="flex gap-2 group animate-in slide-in-from-bottom-2 fade-in duration-500" style={{animationDelay: `${index * 100}ms`}}>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={sub.name}
                      onChange={(e) => handleSubjectChange(sub.id, 'name', e.target.value)}
                      placeholder={`Subject ${index + 1} Name`}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <div className="w-24">
                    <input 
                      type="number" 
                      value={sub.totalClasses}
                      onChange={(e) => handleSubjectChange(sub.id, 'totalClasses', e.target.value)}
                      placeholder="Total"
                      title="Total Classes"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-center text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  {subjects.length > 1 && (
                    <button 
                      onClick={() => handleRemoveSubject(sub.id)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={handleAddSubject}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm font-bold text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
            >
              <Plus size={18} /> Add Another Subject
            </button>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <button 
                onClick={() => setStep(1)}
                className="rounded-xl border border-slate-200 bg-white py-3.5 font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading || !subjects.some(s => s.name)}
                className="rounded-xl bg-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Setting up...' : 'Get Started'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen, profile, onOpenSettings, onSignOut }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'timetable', label: 'Timetable', icon: CalendarRange },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare }, 
    { id: 'grades', label: 'Grades', icon: Calculator }, 
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'announcements', label: 'Announcements', icon: Bell },
  ];

  return (
    <>
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-white transition-transform duration-300 ease-out md:translate-x-0 md:static md:inset-auto flex flex-col h-full border-r border-slate-800 shadow-2xl rounded-r-3xl overflow-hidden
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <GraduationCap size={24} />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight block leading-none text-white">UniPortal</span>
              <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Student</span>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* University Badge */}
        <div className="px-4 py-4">
          <div className="bg-slate-800/50 p-4 border border-slate-700/50">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Institution</p>
            <div className="flex items-start gap-2.5 text-indigo-200">
              <School size={16} className="mt-0.5 shrink-0" />
              <span className="text-xs font-bold leading-tight">Ahmedabad University</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`
                  relative group flex w-full items-center gap-3 px-4 py-3.5 text-sm font-semibold transition-all duration-200 border-l-4
                  ${isActive 
                    ? 'bg-indigo-900/30 text-indigo-300 border-indigo-500' 
                    : 'text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-white hover:border-slate-600'}
                `}
              >
                <Icon size={20} className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-white transition-colors'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button 
              onClick={onOpenSettings}
              className="flex items-center justify-center gap-2 bg-slate-800 p-2.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700 hover:border-slate-600"
              title="Settings"
            >
              <Settings size={18} />
              <span className="text-xs font-bold">Settings</span>
            </button>
            <button 
              onClick={onSignOut}
              className="flex items-center justify-center gap-2 bg-slate-800 p-2.5 text-rose-400 hover:bg-rose-900/30 hover:text-rose-300 transition-colors border border-slate-700 hover:border-rose-900"
              title="Sign Out"
            >
              <LogOut size={18} />
              <span className="text-xs font-bold">Log Out</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-800 p-3 border border-slate-700">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-bold text-white leading-tight">{profile?.name || 'Student'}</p>
              <p className="truncate text-xs text-indigo-300 mt-0.5 font-medium">{profile?.course || 'General'}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Timetable = ({ user, timetable = [], subjects = [] }) => {
  const [activeDay, setActiveDay] = useState('Monday');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClass, setNewClass] = useState({ subject: '', startTime: '', endTime: '', day: 'Monday' });

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!newClass.subject || !newClass.startTime || !newClass.endTime) return;
    
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'timetable'), {
      ...newClass,
      createdAt: serverTimestamp()
    });
    
    setShowAddModal(false);
    setNewClass({ subject: '', startTime: '', endTime: '', day: activeDay });
  };

  const handleDeleteClass = async (id) => {
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'timetable', id));
  };

  const filteredClasses = timetable
    .filter(t => t.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Weekly Timetable</h2>
           <p className="text-slate-500 dark:text-slate-400">Manage your class schedule.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className={matBtnPrimary}
        >
           <Plus size={18} /> Add Class
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {DAYS_OF_WEEK.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`
              rounded-full px-5 py-2 text-xs font-bold transition-all whitespace-nowrap border
              ${activeDay === day 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}
            `}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="space-y-3">
         {filteredClasses.length > 0 ? (
           filteredClasses.map(cls => (
             <div key={cls.id} className={`${matCard} flex items-center justify-between !p-5 hover:scale-[1.01] transition-transform`}>
                <div className="flex items-center gap-5">
                   <div className="flex flex-col items-center justify-center w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600 shadow-inner">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Start</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{cls.startTime}</span>
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">{cls.subject}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-medium bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-md w-fit">
                        <Clock size={12} /> {cls.startTime} - {cls.endTime}
                      </p>
                   </div>
                </div>
                <button 
                  onClick={() => handleDeleteClass(cls.id)}
                  className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                >
                  <Trash2 size={18} />
                </button>
             </div>
           ))
         ) : (
           <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
              <CalendarRange size={48} className="mb-4 opacity-30 text-indigo-500" />
              <p>No classes for {activeDay}</p>
           </div>
         )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
           <div className={`w-full max-w-sm ${matCard}`}>
              <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">Add Class</h3>
              <form onSubmit={handleAddClass} className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Subject</label>
                    <input 
                      type="text" 
                      value={newClass.subject}
                      onChange={e => setNewClass({...newClass, subject: e.target.value})}
                      placeholder="e.g. Mathematics"
                      className={matInput}
                      list="subject-suggestions"
                    />
                    <datalist id="subject-suggestions">
                       {subjects.map(s => <option key={s.id} value={s.name} />)}
                    </datalist>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Start</label>
                      <input 
                        type="time" 
                        value={newClass.startTime}
                        onChange={e => setNewClass({...newClass, startTime: e.target.value})}
                        className={matInput}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">End</label>
                      <input 
                        type="time" 
                        value={newClass.endTime}
                        onChange={e => setNewClass({...newClass, endTime: e.target.value})}
                        className={matInput}
                      />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Day</label>
                    <select 
                      value={newClass.day}
                      onChange={e => setNewClass({...newClass, day: e.target.value})}
                      className={`${matInput} appearance-none cursor-pointer`}
                    >
                       {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                 </div>
                 <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button type="button" onClick={() => setShowAddModal(false)} className={matBtnGhost}>Cancel</button>
                    <button type="submit" className={matBtnPrimary}>Add Class</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = ({ setActiveTab, subjects, profile, checklist = [], announcements = [], groups = [], resources = [], onSelectGroup, timetable = [], onToggleTheme }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getNotificationStatus = () => {
    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000); 
    const activeTasks = checklist.filter(t => !t.completed);
    const urgentTasks = activeTasks.filter(task => {
      if (!task.dueDate) return false;
      const due = new Date(task.dueDate);
      return due < next24h; 
    });

    if (urgentTasks.length > 0) return 'urgent'; 
    if (activeTasks.length > 0) return 'active';
    return 'none';
  };

  const notificationStatus = getNotificationStatus();
  
  const handleBellClick = () => {
    setActiveTab('tasks');
  };

  const conductedAll = subjects.reduce((acc, sub) => acc + (sub.attended || 0) + (sub.leavesTaken || 0), 0);
  const attendedAll = subjects.reduce((acc, sub) => acc + (sub.attended || 0), 0);
  const avgAttendance = conductedAll > 0 ? Math.round((attendedAll / conductedAll) * 100) : 0;
  const dueTodos = checklist.filter(t => !t.completed).sort((a,b) => (b.priority ? 1 : 0) - (a.priority ? 1 : 0) || new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 3);
  
  const getTodaysClasses = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];
    return timetable
      .filter(t => t.day === todayName)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };
  const todaysClasses = getTodaysClasses();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between pt-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{getGreeting()}, {profile?.name?.split(' ')[0] || 'Student'}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 shadow-sm">
              <School size={12} /> {profile?.university}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm">
              <BookOpen size={12} /> {profile?.course}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 shadow-sm">
              <Calendar size={12} /> {profile?.semester}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {/* DARK MODE TOGGLE */}
           <button 
             onClick={onToggleTheme}
             className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shadow-sm transition-all"
             title="Toggle Theme"
           >
             {profile?.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
           </button>

          <div 
            className="relative group cursor-pointer rounded-full bg-white dark:bg-slate-800 p-2.5 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" 
            title="Notifications"
            onClick={handleBellClick}
          >
            <Bell 
              size={24} 
              className={`transition-colors duration-300 ${notificationStatus === 'urgent' ? 'text-rose-500 animate-swing' : 'text-slate-300 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-200'}
              `} 
            />
            {notificationStatus !== 'none' && (
              <span className={`absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full shadow-[0_0_10px_currentColor] ${notificationStatus === 'urgent' ? 'bg-rose-500 text-rose-500' : 'bg-amber-400 text-amber-400'}`}></span>
            )}
          </div>
          
          <button onClick={() => setActiveTab('tasks')} className={matBtnPrimary}>
             <Plus size={18} /> New Task
          </button>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Attendance Card */}
        <div 
          onClick={() => setActiveTab('attendance')}
          className={`${matCard} cursor-pointer group h-64 flex flex-col justify-between overflow-hidden relative`}
        >
           <div className="absolute top-4 right-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 h-8 w-8 flex items-center justify-center rounded-full text-emerald-600 dark:text-emerald-400">
                  <CalendarCheck size={16} />
               </div>
           </div>
          
          <div className="relative z-10">
             <div className="flex justify-between items-start">
               <h3 className="font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">Attendance</h3>
             </div>
             <div className="mt-4">
               <span className={`text-6xl font-bold tracking-tighter ${avgAttendance >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>{avgAttendance}%</span>
               <div className="flex items-center gap-2 mt-2">
                 {avgAttendance >= 75 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle size={12} /> On Track
                    </span>
                 ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                      <AlertTriangle size={12} /> Warning
                    </span>
                 )}
               </div>
            </div>
          </div>
          
          <div className="relative z-10 mt-auto w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
             <div 
                className={`h-full rounded-full transition-all duration-1000 ${avgAttendance >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                style={{ width: `${avgAttendance}%` }} 
             />
          </div>
        </div>

        {/* Tasks Card */}
        <div 
          onClick={() => setActiveTab('tasks')}
          className={`${matCard} cursor-pointer group h-64 flex flex-col`}
        >
          <div className="absolute top-4 right-4">
             <div className="bg-indigo-50 dark:bg-indigo-900/20 h-8 w-8 flex items-center justify-center rounded-full text-indigo-600 dark:text-indigo-400">
                <CheckSquare size={16} />
             </div>
          </div>
          <h3 className="font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Next Tasks</h3>
          
          <div className="flex-1 overflow-hidden space-y-3 relative z-10">
              {dueTodos.length > 0 ? (
                dueTodos.slice(0, 3).map(todo => (
                  <div key={todo.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className={`h-2.5 w-2.5 rounded-full ${todo.priority ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
                      <div className="flex-1 overflow-hidden">
                         <p className="truncate font-medium text-sm text-slate-700 dark:text-slate-200">{todo.task}</p>
                         {todo.dueDate && <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Due: {new Date(todo.dueDate).toLocaleDateString()}</p>}
                      </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 font-medium text-sm italic">
                  <CheckCircle size={32} className="mb-2 opacity-20" />
                  All caught up!
                </div>
              )}
          </div>
        </div>

        {/* Today's Classes */}
        <div 
          className={`${matCard} cursor-pointer group h-64 flex flex-col`}
          onClick={() => setActiveTab('timetable')}
        >
          <div className="flex justify-between items-start mb-6">
             <h3 className="font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest">Today's Classes</h3>
             <div className="bg-blue-50 dark:bg-blue-900/20 h-8 w-8 flex items-center justify-center rounded-full text-blue-600 dark:text-blue-400"><CalendarRange size={16} /></div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
              {todaysClasses.length > 0 ? (
                todaysClasses.map(t => (
                  <div key={t.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{t.subject}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t.startTime} - {t.endTime}</p>
                      </div>
                      <div className="h-6 w-1 bg-indigo-500 rounded-full"></div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 font-medium text-sm italic">
                   <CalendarRange size={32} className="mb-2 opacity-20" />
                   No classes today
                </div>
              )}
          </div>
        </div>

        {/* Updates Card (Gradient) */}
        <div 
           onClick={() => setActiveTab('announcements')}
           className="rounded-3xl p-6 shadow-lg bg-gradient-to-br from-indigo-600 to-purple-700 text-white cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all relative overflow-hidden h-64 flex flex-col justify-between"
        >
           <div className="absolute top-4 right-4">
                <div className="bg-white/20 h-8 w-8 flex items-center justify-center rounded-full text-white backdrop-blur-sm">
                  <Bell size={16} />
                </div>
           </div>
           <div className="relative z-10">
              <h3 className="font-bold text-sm uppercase tracking-widest text-indigo-100">Updates</h3>
              <div className="mt-4">
                <span className="text-5xl font-bold tracking-tighter drop-shadow-sm">{announcements.length}</span>
                <p className="text-indigo-100 text-sm font-medium mt-1">Active Announcements</p>
              </div>
           </div>
           
           <div className="relative z-10">
             <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg px-4 py-2 text-xs font-bold transition-colors">
                View Board <ArrowRight size={14} />
             </button>
           </div>

           <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
             <Bell size={140} className="text-white"/>
           </div>
        </div>
      </div>
      
      {/* Attendance Breakdown (Bottom Wide) */}
      <div 
        onClick={() => setActiveTab('attendance')}
        className={`${matCard} mt-6 cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-8 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300">
               <LayoutDashboard size={20} />
             </div>
             <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Subject Breakdown</h2>
                <p className="text-xs text-slate-400 font-medium">Detailed attendance metrics</p>
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(sub => {
            const conducted = (sub.attended || 0) + (sub.leavesTaken || 0);
            const pct = conducted > 0 ? Math.round((sub.attended / conducted) * 100) : 0;
            const isGood = pct >= 75;
            return (
              <div key={sub.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                          <Book size={16} />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white truncate pr-4 text-sm">{sub.name}</h4>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${isGood ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'}`}>{pct}%</span>
                </div>
                
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 mb-4">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${isGood ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1"><Check size={10} /> Attended: {sub.attended}</span>
                  <span className="flex items-center gap-1"><Hash size={10} /> Total: {conducted}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

const AttendanceTracker = ({ user, subjects, showToast }) => {
  const [editingSubject, setEditingSubject] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', totalClasses: 40 });

  const updateAttendance = async (subject, changeType) => {
    const totalClasses = subject.totalClasses || 0;
    const currentAttended = subject.attended || 0;
    const currentLeaves = subject.leavesTaken || 0;
    const conducted = currentAttended + currentLeaves;

    if (conducted >= totalClasses) {
      showToast(`Limit reached! Total classes set to ${totalClasses}. Edit subject to increase.`, 'error');
      return;
    }

    const subRef = doc(db, 'artifacts', appId, 'users', user.uid, 'subjects', subject.id);
    const updates = {};
    if (changeType === 'attend') {
      updates.attended = currentAttended + 1;
    } else if (changeType === 'miss') {
      updates.leavesTaken = currentLeaves + 1;
    }
    await updateDoc(subRef, updates);
    showToast('Attendance updated successfully', 'success');
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.name.trim() || !user) return;

    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'subjects'), {
      name: newSubject.name,
      totalClasses: parseInt(newSubject.totalClasses) || 40,
      attended: 0,
      leavesTaken: 0,
      createdAt: serverTimestamp()
    });
    
    setNewSubject({ name: '', totalClasses: 40 });
    setShowAddModal(false);
    showToast('Subject added successfully', 'success');
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingSubject) return;
    
    const newTotal = parseInt(editingSubject.totalClasses) || 0;
    const newAttended = parseInt(editingSubject.attended) || 0;
    const newLeaves = parseInt(editingSubject.leavesTaken) || 0;

    if (newAttended + newLeaves > newTotal) {
       showToast(`Attended + Leaves cannot exceed Total Classes (${newTotal})`, 'error');
       return;
    }

    const subRef = doc(db, 'artifacts', appId, 'users', user.uid, 'subjects', editingSubject.id);
    await updateDoc(subRef, {
      totalClasses: newTotal,
      attended: newAttended,
      leavesTaken: newLeaves
    });
    setEditingSubject(null);
    showToast('Subject updated successfully', 'success');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance Tracker</h2>
          <p className="text-slate-500 dark:text-slate-400">Compulsory 75% attendance required.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className={matBtnPrimary}
        >
          <Plus size={18} /> <span className="hidden sm:inline">Add Subject</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {subjects.map(subject => {
          const attended = subject.attended || 0;
          const leavesTaken = subject.leavesTaken || 0;
          const totalClasses = subject.totalClasses || 40;
          const conducted = attended + leavesTaken;
          const currentPercentage = conducted > 0 ? Math.round((attended / conducted) * 100) : 0;
          const maxAllowedLeavesTotal = Math.floor(totalClasses * 0.25);
          const leavesRemaining = maxAllowedLeavesTotal - leavesTaken;
          const isLimitReached = conducted >= totalClasses;
          const isSafe = currentPercentage >= 75;
          const isBudgetExhausted = leavesRemaining < 0;

          return (
            <div key={subject.id} className={`${matCard} group relative overflow-hidden`}>
              <button 
                onClick={() => setEditingSubject(subject)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
              >
                <Edit2 size={16} />
              </button>

              <div className="flex items-start justify-between pr-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{subject.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                     <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${isSafe ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'}`}>
                        {isSafe ? 'Safe' : 'Critical'}
                     </span>
                     <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        {attended} / {conducted} (Total: {totalClasses})
                     </span>
                  </div>
                </div>
                <div className={`flex flex-col items-end`}>
                   <div className={`text-3xl font-bold tracking-tight ${isSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {currentPercentage}%
                   </div>
                   <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Current</div>
                </div>
              </div>

              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700 relative">
                <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-slate-300 dark:bg-slate-600 z-10" title="75% Mark"></div>
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out ${isSafe ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${currentPercentage}%` }}
                />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-4 text-center border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Attended</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{attended}</p>
                  <button 
                    onClick={() => updateAttendance(subject, 'attend')}
                    disabled={isLimitReached}
                    className={`mt-3 w-full rounded-lg py-2 text-xs font-bold transition-all shadow-sm ${isLimitReached ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'}`}
                  >
                    I was Present
                  </button>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-4 text-center border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Leaves</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{leavesTaken}</p>
                  <button 
                    onClick={() => updateAttendance(subject, 'miss')}
                    disabled={isLimitReached}
                    className={`mt-3 w-full rounded-lg py-2 text-xs font-bold transition-all shadow-sm ${isLimitReached ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50'}`}
                  >
                    I was Absent
                  </button>
                </div>
              </div>
              
              <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-900 p-3 flex items-start gap-3">
                <div className={`mt-0.5 ${isBudgetExhausted || leavesRemaining < 3 ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400'}`}>
                   {isBudgetExhausted ? <AlertTriangle size={16} /> : <AlertCircle size={16} />}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isLimitReached ? (
                    <span className="font-medium text-slate-500">Semester Limit Reached. Edit subject to add more classes.</span>
                  ) : isBudgetExhausted ? (
                     <span>You have exceeded the leave limit for this semester!</span>
                  ) : (
                     <span>You can take <strong>{leavesRemaining}</strong> more leaves this semester while staying above 75%.</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`w-full max-w-sm ${matCard}`}>
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Add New Subject</h3>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Subject Name</label>
                <input 
                  type="text" 
                  value={newSubject.name} 
                  onChange={e => setNewSubject({...newSubject, name: e.target.value})} 
                  placeholder="e.g. Data Structures"
                  className={matInput}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total Classes (Est.)</label>
                <input 
                  type="number" 
                  value={newSubject.totalClasses} 
                  onChange={e => setNewSubject({...newSubject, totalClasses: e.target.value})} 
                  className={matInput}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-700 mt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className={matBtnGhost}>Cancel</button>
                <button type="submit" disabled={!newSubject.name} className={matBtnPrimary}>Add Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`w-full max-w-sm ${matCard}`}>
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Edit Subject Details</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Manually adjust counts for {editingSubject.name}</p>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total Classes (Semester)</label>
                <input 
                  type="number" 
                  value={editingSubject.totalClasses} 
                  onChange={e => setEditingSubject({...editingSubject, totalClasses: e.target.value})} 
                  className={matInput}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Attended</label>
                  <input 
                    type="number" 
                    value={editingSubject.attended} 
                    onChange={e => setEditingSubject({...editingSubject, attended: e.target.value})} 
                    className={matInput}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Leaves</label>
                  <input 
                    type="number" 
                    value={editingSubject.leavesTaken} 
                    onChange={e => setEditingSubject({...editingSubject, leavesTaken: e.target.value})} 
                    className={matInput}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-700 mt-2">
                <button type="button" onClick={() => setEditingSubject(null)} className={matBtnGhost}>Cancel</button>
                <button type="submit" className={matBtnPrimary}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Checklist = ({ user, todos }) => {
  const [newTask, setNewTask] = useState('');
  const [newDate, setNewDate] = useState('');
  const [isPriority, setIsPriority] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'checklist'), {
      task: newTask,
      dueDate: newDate,
      priority: isPriority,
      completed: false,
      createdAt: serverTimestamp()
    });
    setNewTask('');
    setNewDate('');
    setIsPriority(false);
  };

  const toggleComplete = async (todo) => {
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'checklist', todo.id), {
      completed: !todo.completed
    });
  };

  const deleteTodo = async (id) => {
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'checklist', id));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">To-Do Checklist</h2>
          <p className="text-slate-500 dark:text-slate-400">Track your assignments and study goals.</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className={matCard}>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <input 
              type="text" 
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              placeholder="What needs to be done?"
              className={matInput}
            />
          </div>
          <div className="flex gap-2">
            <input 
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className={`${matInput} w-auto`}
            />
            <button 
              type="button"
              onClick={() => setIsPriority(!isPriority)}
              className={`rounded-xl border px-4 py-2 transition-colors ${isPriority ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-indigo-500'}`}
              title="Toggle Priority"
            >
              <Flag size={20} className={isPriority ? 'fill-current' : ''} />
            </button>
            <button type="submit" className={matBtnPrimary}>
              Add
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-3">
        {[...todos].sort((a,b) => (b.priority ? 1 : 0) - (a.priority ? 1 : 0)).map((todo, index) => (
          <div 
            key={todo.id} 
            className={`flex items-center gap-4 rounded-xl border p-4 transition-all duration-300 hover:shadow-sm ${todo.completed ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'}`}
          >
            <button 
              onClick={() => toggleComplete(todo)}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all ${todo.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'}`}
            >
              {todo.completed && <CheckSquare size={14} />}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className={`font-medium transition-colors ${todo.completed ? 'text-slate-500 line-through decoration-slate-400' : 'text-slate-900 dark:text-white'}`}>{todo.task}</p>
                {todo.priority && !todo.completed && (
                  <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-100">HIGH</span>
                )}
              </div>
              {todo.dueDate && (
                <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  <Clock size={12} /> Due: {new Date(todo.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <button onClick={() => deleteTodo(todo.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-2 rounded-lg">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {todos.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-300">
              <CheckSquare size={32} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No tasks yet.</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm">Add one above to stay organized!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const GradeCalculator = ({ user, showToast }) => {
  const [semesters, setSemesters] = useState([]);
  
  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'grades'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allSemesters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSemesters(allSemesters.sort((a,b) => a.order - b.order));
    });
    return () => unsubscribe();
  }, [user]);

  const addSemester = async () => {
    const nextOrder = semesters.length + 1;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'grades'), {
      name: `Semester ${nextOrder}`,
      order: nextOrder,
      subjects: [],
      createdAt: serverTimestamp()
    });
  };

  const addSubjectToSemester = async (semesterId, existingSubjects) => {
    const newSubject = { id: Date.now(), name: '', credits: 3, grade: 'A' };
    const semRef = doc(db, 'artifacts', appId, 'users', user.uid, 'grades', semesterId);
    await updateDoc(semRef, { subjects: [...existingSubjects, newSubject] });
  };

  const updateSubject = async (semesterId, subjects, subId, field, value) => {
    const updatedSubjects = subjects.map(s => s.id === subId ? { ...s, [field]: value } : s);
    const semRef = doc(db, 'artifacts', appId, 'users', user.uid, 'grades', semesterId);
    await updateDoc(semRef, { subjects: updatedSubjects });
  };

  const deleteSubject = async (semesterId, subjects, subId) => {
    const updatedSubjects = subjects.filter(s => s.id !== subId);
    const semRef = doc(db, 'artifacts', appId, 'users', user.uid, 'grades', semesterId);
    await updateDoc(semRef, { subjects: updatedSubjects });
  };
  
  const deleteSemester = async (id) => {
     if(confirm('Delete this semester?')) {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'grades', id));
     }
  }

  const calculateSGPA = (subjects) => {
    let totalPoints = 0;
    let totalCredits = 0;
    subjects.forEach(sub => {
      const credits = parseFloat(sub.credits) || 0;
      const points = GRADE_POINTS[sub.grade] || 0;
      totalPoints += points * credits;
      totalCredits += credits;
    });
    return totalCredits === 0 ? 0 : (totalPoints / totalCredits).toFixed(2);
  };

  const calculateCGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;
    semesters.forEach(sem => {
      sem.subjects.forEach(sub => {
        const credits = parseFloat(sub.credits) || 0;
        const points = GRADE_POINTS[sub.grade] || 0;
        totalPoints += points * credits;
        totalCredits += credits;
      });
    });
    return totalCredits === 0 ? 0 : (totalPoints / totalCredits).toFixed(2);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">CGPA Calculator</h2>
            <p className="text-slate-500 dark:text-slate-400">Track your academic performance.</p>
         </div>
         <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Overall CGPA</p>
               <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{calculateCGPA()}</p>
            </div>
            <button onClick={addSemester} className={matBtnPrimary}>
              <Plus size={18} /> Add Semester
            </button>
         </div>
      </div>

      <div className="space-y-6">
        {semesters.map(sem => (
          <div key={sem.id} className={matCard}>
             <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{sem.name}</h3>
                <div className="flex items-center gap-4">
                   <span className="text-sm font-medium text-slate-500 dark:text-slate-400">SGPA: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{calculateSGPA(sem.subjects)}</span></span>
                   <button onClick={() => deleteSemester(sem.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={16} /></button>
                </div>
             </div>
             
             <div className="space-y-3">
                {sem.subjects.map(sub => (
                   <div key={sub.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5 sm:col-span-6">
                         <input 
                            type="text" 
                            placeholder="Subject Name" 
                            value={sub.name} 
                            onChange={(e) => updateSubject(sem.id, sem.subjects, sub.id, 'name', e.target.value)}
                            className={matInput}
                         />
                      </div>
                      <div className="col-span-3 sm:col-span-2">
                         <input 
                            type="number" 
                            placeholder="Credits" 
                            value={sub.credits} 
                            onChange={(e) => updateSubject(sem.id, sem.subjects, sub.id, 'credits', e.target.value)}
                            className={`${matInput} text-center`}
                         />
                      </div>
                      <div className="col-span-3 sm:col-span-3">
                         <select 
                            value={sub.grade} 
                            onChange={(e) => updateSubject(sem.id, sem.subjects, sub.id, 'grade', e.target.value)}
                            className={`${matInput} appearance-none cursor-pointer`}
                         >
                            {Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}
                         </select>
                      </div>
                      <div className="col-span-1 text-center">
                         <button onClick={() => deleteSubject(sem.id, sem.subjects, sub.id)} className="text-slate-500 hover:text-rose-400 transition-colors"><X size={16} /></button>
                      </div>
                   </div>
                ))}
             </div>
             
             <button 
                onClick={() => addSubjectToSemester(sem.id, sem.subjects)}
                className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
             >
                <Plus size={14} /> Add Subject
             </button>
          </div>
        ))}
        {semesters.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
             <Calculator size={48} className="mx-auto mb-4 opacity-20" />
             <p>No semesters added. Start calculating!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Groups = ({ user, groups, initialGroup, onClearInitialGroup, showToast, profile }) => {
  const [selectedGroup, setSelectedGroup] = useState(initialGroup || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  useEffect(() => {
    if (initialGroup) {
      setSelectedGroup(initialGroup);
      onClearInitialGroup(); 
    }
  }, [initialGroup, onClearInitialGroup]);

  useEffect(() => {
    if (!selectedGroup) return;
    const messagesRef = collection(db, 'artifacts', appId, 'public', 'data', 'messages');
    const q = query(messagesRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sortedMsgs = allMsgs
        .filter(m => m.groupId === selectedGroup.id)
        .sort(sortByDateAsc);
      setMessages(sortedMsgs);
    }, (error) => console.log(error));
    return () => unsubscribe();
  }, [selectedGroup]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !user) return;
    
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'groups'), {
      name: newGroupName,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      memberCount: 1,
      inviteCode: inviteCode,
      members: [user.uid]
    });
    
    setSelectedGroup({ id: docRef.id, name: newGroupName, inviteCode, members: [user.uid] });
    setNewGroupName('');
    setShowCreateModal(false);
    showToast('Group created successfully!', 'success');
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) return;
    const targetGroup = groups.find(g => g.inviteCode === joinCode.trim().toUpperCase());
    
    if (targetGroup) {
      if (targetGroup.members?.includes(user.uid)) {
        showToast('You are already in this group', 'success');
        setSelectedGroup(targetGroup);
      } else {
        const groupRef = doc(db, 'artifacts', appId, 'public', 'data', 'groups', targetGroup.id);
        await updateDoc(groupRef, {
          members: arrayUnion(user.uid),
          memberCount: (targetGroup.memberCount || 0) + 1
        });
        showToast('Joined group successfully!', 'success');
        setSelectedGroup(targetGroup);
      }
      setJoinCode('');
      setShowJoinModal(false);
    } else {
      showToast('Invalid Invite Code', 'error');
    }
  };

  const handleLeaveGroup = async () => {
    if (!selectedGroup || !user) return;
    if (confirm("Are you sure you want to leave this group?")) {
      const groupRef = doc(db, 'artifacts', appId, 'public', 'data', 'groups', selectedGroup.id);
      await updateDoc(groupRef, {
        members: arrayRemove(user.uid),
        memberCount: (selectedGroup.memberCount || 1) - 1
      });
      setSelectedGroup(null);
      showToast('You left the group.', 'success');
    }
  };

  const handleCreatePoll = async () => {
    if (!pollQuestion.trim() || pollOptions.some(o => !o.trim())) return;
    
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), {
      type: 'poll',
      text: "New Poll", 
      poll: {
        question: pollQuestion,
        options: pollOptions,
        votes: {} 
      },
      groupId: selectedGroup.id,
      senderId: user.uid,
      senderName: profile?.name || 'Student',
      senderInitial: (profile?.name || 'S').charAt(0).toUpperCase(),
      createdAt: serverTimestamp(),
      isPinned: false
    });
    
    setPollQuestion('');
    setPollOptions(['', '']);
    setShowPollModal(false);
  };

  const handleVote = async (message, optionIndex) => {
    if (!user) return;
    const msgRef = doc(db, 'artifacts', appId, 'public', 'data', 'messages', message.id);
    const currentVotes = message.poll.votes || {};
    const newVotes = { ...currentVotes, [user.uid]: optionIndex };
    
    await updateDoc(msgRef, {
      "poll.votes": newVotes
    });
  };

  const togglePin = async (message) => {
    const msgRef = doc(db, 'artifacts', appId, 'public', 'data', 'messages', message.id);
    await updateDoc(msgRef, { isPinned: !message.isPinned });
  };

  const handleAttachFile = () => {
    const types = ['pdf', 'docx', 'pptx'];
    const type = types[Math.floor(Math.random() * types.length)];
    setFileToUpload({ name: `Assignment_Draft.${type}`, type: type });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !fileToUpload) || !user || !selectedGroup) return;

    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), {
      text: newMessage,
      file: fileToUpload, 
      type: 'text',
      groupId: selectedGroup.id,
      senderId: user.uid,
      senderName: profile?.name || 'Student', 
      senderInitial: (profile?.name || 'S').charAt(0).toUpperCase(),
      createdAt: serverTimestamp(),
      isPinned: false
    });
    setNewMessage('');
    setFileToUpload(null);
  };

  const copyInviteLink = () => {
    if (!selectedGroup?.inviteCode) return;
    const textArea = document.createElement("textarea");
    textArea.value = selectedGroup.inviteCode;
    textArea.style.position = "fixed"; 
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Invite code copied to clipboard!', 'success');
    } catch (err) {
      console.error('Copy failed', err);
      showToast('Failed to copy code', 'error');
    }
    document.body.removeChild(textArea);
  };

  const joinedGroups = groups.filter(g => g.members && g.members.includes(user.uid));
  const pinnedMessages = messages.filter(m => m.isPinned);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm md:flex-row">
      <div className={`
        flex w-full flex-col border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 md:w-80
        ${selectedGroup ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">Your Groups</h3>
          <div className="flex gap-2">
            <button onClick={() => setShowJoinModal(true)} className={matIconBtn}><LinkIcon size={14} /></button>
            <button onClick={() => setShowCreateModal(true)} className={matIconBtn}><Plus size={18} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {joinedGroups.map(group => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              className={`mb-2 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${selectedGroup?.id === group.id ? 'bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold">
                {group.name.substring(0,2).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium text-slate-900 dark:text-white">{group.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Active Discussion</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={`flex flex-1 flex-col bg-white dark:bg-slate-800 ${!selectedGroup ? 'hidden md:flex' : 'flex'}`}>
        {selectedGroup ? (
          <>
            <div className="border-b border-slate-100 dark:border-slate-700 shadow-sm p-4 flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedGroup(null)} className="md:hidden text-slate-500"><X size={24}/></button>
                  <h3 className="font-bold text-slate-900 dark:text-white">{selectedGroup.name}</h3>
               </div>
               <div className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-600">Code: <span className="font-mono text-indigo-600 dark:text-indigo-400">{selectedGroup.inviteCode}</span></div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-6 custom-scrollbar bg-slate-50 dark:bg-slate-900">
              {messages.map(msg => (
                 <div key={msg.id} className={`flex gap-3 ${msg.senderId === user.uid ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${msg.senderId === user.uid ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                      {msg.senderName.charAt(0)}
                    </div>
                    <div className={`rounded-2xl px-4 py-2.5 max-w-[75%] text-sm ${msg.senderId === user.uid ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm'}`}>
                       {msg.type === 'poll' ? (
                          <div>
                             <p className="font-bold mb-2 flex items-center gap-2"><BarChart2 size={14}/> {msg.poll.question}</p>
                             {msg.poll.options.map((opt, i) => (
                                <div key={i} className="bg-slate-100 dark:bg-slate-700 p-2 rounded mb-1 text-xs">{opt}</div>
                             ))}
                          </div>
                       ) : (
                          <p>{msg.text}</p>
                       )}
                       {msg.createdAt && <span className="text-[10px] opacity-70 block text-right mt-1">{formatDate(msg.createdAt)}</span>}
                    </div>
                 </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
               <form onSubmit={handleSendMessage} className="flex gap-2">
                  <button type="button" onClick={() => setShowPollModal(true)} className={matIconBtn}><BarChart2 size={20}/></button>
                  <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type message..." className={`${matInput} rounded-full`} />
                  <button type="submit" className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"><ArrowRight size={20}/></button>
               </form>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p>Select a group to start chatting</p>
          </div>
        )}
      </div>

      {/* Modals for Create Group / Join / Poll would go here (simplified for brevity, logic exists in prev response) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className={`w-full max-w-sm ${matCard}`}>
              <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">New Group</h3>
              <input type="text" placeholder="Group Name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className={matInput} />
              <div className="mt-4 flex justify-end gap-2">
                 <button onClick={() => setShowCreateModal(false)} className={matBtnGhost}>Cancel</button>
                 <button onClick={handleCreateGroup} className={matBtnPrimary}>Create</button>
              </div>
           </div>
        </div>
      )}
       {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className={`w-full max-w-sm ${matCard}`}>
              <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Join Group</h3>
              <input type="text" placeholder="Enter Invite Code" value={joinCode} onChange={e => setJoinCode(e.target.value)} className={matInput} />
              <div className="mt-4 flex justify-end gap-2">
                 <button onClick={() => setShowJoinModal(false)} className={matBtnGhost}>Cancel</button>
                 <button onClick={handleJoinGroup} className={matBtnPrimary}>Join</button>
              </div>
           </div>
        </div>
      )}

      {showPollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl animate-in fade-in zoom-in-95">
             <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Create Poll</h3>
             <input 
               type="text" 
               placeholder="Question (e.g. When to meet?)" 
               value={pollQuestion}
               onChange={e => setPollQuestion(e.target.value)}
               className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-2 mb-4 outline-none focus:border-indigo-500"
             />
             <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
               {pollOptions.map((opt, i) => (
                 <input 
                   key={i}
                   type="text"
                   placeholder={`Option ${i + 1}`}
                   value={opt}
                   onChange={e => {
                     const newOpts = [...pollOptions];
                     newOpts[i] = e.target.value;
                     setPollOptions(newOpts);
                   }}
                   className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                 />
               ))}
             </div>
             <button onClick={() => setPollOptions([...pollOptions, ''])} className="text-xs text-indigo-600 font-bold mb-4 flex items-center gap-1">+ Add Option</button>
             
             <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => setShowPollModal(false)} className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100">Cancel</button>
                <button onClick={handleCreatePoll} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">Post Poll</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Resources = ({ user, showToast }) => {
  const [resources, setResources] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newRes, setNewRes] = useState({ title: '', link: '', type: 'link' });
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'resources'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allRes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sortedRes = allRes.sort(sortByDateDesc);
      setResources(sortedRes);
    }, (error) => console.log(error));
    return () => unsubscribe();
  }, []);

  const handleShare = async () => {
    if (!newRes.title || !newRes.link || !user) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'resources'), {
      ...newRes,
      uploadedBy: user.uid,
      authorName: 'Student Peer',
      createdAt: serverTimestamp()
    });
    setNewRes({ title: '', link: '', type: 'link' });
    setShowModal(false);
    showToast('Resource shared successfully!', 'success');
  };

  const filteredResources = activeFilter === 'all' 
    ? resources 
    : resources.filter(r => r.type === activeFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Shared Resources</h2>
          <p className="text-slate-500 dark:text-slate-400">Access notes, videos, and assignments.</p>
        </div>
        <button onClick={() => setShowModal(true)} className={matBtnPrimary}>
          <Upload size={18} /> <span>Share</span>
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'link', 'pdf', 'video'].map(type => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`
              flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors
              ${activeFilter === type 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}
            `}
          >
            {type === 'all' ? <Filter size={12} /> : null}
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map(res => (
          <div key={res.id} className={`${matCard} flex flex-col justify-between hover:shadow-md transition-shadow`}>
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-2">{getResourceIcon(res.type)}</div>
                <span className="text-[10px] text-slate-400 font-medium uppercase">{res.type}</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2">{res.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Shared by {res.authorName}</p>
            </div>
            <a 
              href={res.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 transition-colors"
            >
              <Download size={16} /> Open Resource
            </a>
          </div>
        ))}
        {filteredResources.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <FileText size={48} className="mx-auto mb-4 text-slate-300" />
            <p>No resources found for this filter.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-md ${matCard}`}>
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Share Resource</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Resource Title" value={newRes.title} onChange={e => setNewRes({...newRes, title: e.target.value})} className={matInput} />
              <input type="text" placeholder="Link URL (e.g., Drive link)" value={newRes.link} onChange={e => setNewRes({...newRes, link: e.target.value})} className={matInput} />
              <select value={newRes.type} onChange={e => setNewRes({...newRes, type: e.target.value})} className={matInput}>
                <option value="link">Web Link</option>
                <option value="pdf">PDF Document</option>
                <option value="video">Video Lecture</option>
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className={matBtnGhost}>Cancel</button>
              <button onClick={handleShare} className={matBtnPrimary}>Share</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Announcements = ({ user, announcements, showToast }) => {
  const [showModal, setShowModal] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: '', content: '', dueDate: '' });

  const handlePost = async () => {
    if (!newAnn.title || !user) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'announcements'), {
      ...newAnn,
      postedBy: user.uid,
      posterName: 'Peer Student',
      createdAt: serverTimestamp()
    });
    setNewAnn({ title: '', content: '', dueDate: '' });
    setShowModal(false);
    showToast('Announcement posted successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Community Board</h2>
          <p className="text-slate-500 dark:text-slate-400">Upcoming events and important deadlines.</p>
        </div>
        <button onClick={() => setShowModal(true)} className={matBtnPrimary}>
          <Plus size={18} /> <span>Post Event</span>
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map(ann => (
          <div key={ann.id} className={matCard}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{ann.title}</h3>
                <p className="mt-1 text-slate-600 dark:text-slate-300">{ann.content}</p>
              </div>
              {ann.dueDate && (
                <div className="shrink-0 rounded-lg bg-rose-50 dark:bg-rose-900/30 px-3 py-1 text-center border border-rose-100 dark:border-rose-800">
                  <p className="text-xs font-bold uppercase text-rose-600 dark:text-rose-400">Due</p>
                  <p className="text-sm font-bold text-rose-800 dark:text-rose-200">{new Date(ann.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
               <span className="flex items-center gap-1"><Users size={14} /> Posted by {ann.posterName}</span>
               <span className="flex items-center gap-1"><Clock size={14} /> {formatDate(ann.createdAt)}</span>
            </div>
          </div>
        ))}
        {announcements.length === 0 && <p className="text-center text-slate-400">No active announcements.</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-md ${matCard}`}>
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Post Announcement</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Event Title" value={newAnn.title} onChange={e => setNewAnn({...newAnn, title: e.target.value})} className={matInput} />
              <textarea placeholder="Description" value={newAnn.content} onChange={e => setNewAnn({...newAnn, content: e.target.value})} rows="3" className={matInput} />
              <input type="date" value={newAnn.dueDate} onChange={e => setNewAnn({...newAnn, dueDate: e.target.value})} className={matInput} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className={matBtnGhost}>Cancel</button>
              <button onClick={handlePost} className={matBtnPrimary}>Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsModal = ({ user, profile, onClose, showToast }) => {
  const [formData, setFormData] = useState(profile || {});

  const handleSave = async () => {
    if (!user) return;
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), formData);
    showToast('Profile updated successfully!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Edit Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500">Full Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-lg border px-3 py-2 mt-1" />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500">Course</label>
              <div className="relative">
                <select 
                  value={formData.course} 
                  onChange={e => setFormData({...formData, course: e.target.value})} 
                  className="w-full appearance-none rounded-lg border px-3 py-2 mt-1 outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="" disabled>Select your Major</option>
                  {UNIVERSITY_DATA["Ahmedabad University"].map((category) => (
                    <optgroup key={category.category} label={category.category}>
                      {category.courses.map((course) => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-4 rotate-90 text-slate-400 pointer-events-none" size={14} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Semester</label>
              <div className="relative">
                <select 
                  value={formData.semester}
                  onChange={e => setFormData({...formData, semester: e.target.value})}
                  className="w-full appearance-none rounded-lg border px-3 py-2 mt-1 outline-none focus:border-indigo-500 bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={`Semester ${sem}`}>Semester {sem}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-4 rotate-90 text-slate-400 pointer-events-none" size={14} />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100">Cancel</button>
          <button onClick={handleSave} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false); // New state for login spinner
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedGroupFromDash, setSelectedGroupFromDash] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  
  // Data States
  const [subjects, setSubjects] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [groups, setGroups] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [resources, setResources] = useState([]);
  const [timetable, setTimetable] = useState([]);

  // Toast Handler
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Theme Handler
  const handleToggleTheme = async () => {
    if (!user || !profile) return;
    const currentTheme = profile.theme || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), {
        theme: newTheme
      });
    } catch (error) {
      console.error("Error toggling theme:", error);
      showToast("Failed to toggle theme", "error");
    }
  };

  // Auth Functions
  const handleLogin = async () => {
    setLoggingIn(true);
    try {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    } catch (error) {
      console.error("Login failed", error);
      // Fallback to anonymous login if custom token fails
      try {
        await signInAnonymously(auth);
      } catch (innerError) {
        showToast("Login failed completely. Please refresh.", "error");
        setLoggingIn(false);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      setSubjects([]); 
      setChecklist([]);
      setLoggingIn(false);
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  // Initial Auth Check
  useEffect(() => {
    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const profileRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'main');
        const unsubProfile = onSnapshot(profileRef, (snap) => {
          if (snap.exists()) setProfile(snap.data());
          else setProfile(null);
        });
        return () => unsubProfile(); 
      } else {
        setLoggingIn(false);
      }
      setLoading(false);
    });
  }, []);

  // Data Fetching
  useEffect(() => {
    if (!user || !profile) return;

    const subRef = collection(db, 'artifacts', appId, 'users', user.uid, 'subjects');
    const unsubSub = onSnapshot(subRef, (snap) => setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const checkRef = collection(db, 'artifacts', appId, 'users', user.uid, 'checklist');
    const unsubCheck = onSnapshot(checkRef, (snap) => setChecklist(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const groupsRef = collection(db, 'artifacts', appId, 'public', 'data', 'groups');
    const unsubGroups = onSnapshot(groupsRef, (snap) => setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const annRef = collection(db, 'artifacts', appId, 'public', 'data', 'announcements');
    const unsubAnn = onSnapshot(annRef, (snap) => setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const resRef = collection(db, 'artifacts', appId, 'public', 'data', 'resources');
    const unsubRes = onSnapshot(resRef, (snap) => setResources(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const timeRef = collection(db, 'artifacts', appId, 'users', user.uid, 'timetable');
    const unsubTime = onSnapshot(timeRef, (snap) => setTimetable(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => {
      unsubSub();
      unsubCheck();
      unsubGroups();
      unsubAnn();
      unsubRes();
      unsubTime();
    };
  }, [user, profile]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-slate-500 font-medium">Loading Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} isLoggingIn={loggingIn} />;
  }

  if (user && !profile) {
    return <Onboarding user={user} onComplete={() => {}} />; 
  }

  return (
    <div className={`flex h-screen overflow-hidden bg-slate-50/50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 ${profile?.theme === 'dark' ? 'dark' : ''}`}>
      {/* Scrollbar Style Injection */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        profile={profile}
        onOpenSettings={() => { setShowSettings(true); setMobileMenuOpen(false); }}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-4 backdrop-blur-md md:hidden">
          <h1 className="font-bold text-slate-900 dark:text-white">UniPortal</h1>
          <button onClick={() => setMobileMenuOpen(true)}>
            <Menu className="text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              setActiveTab={setActiveTab} 
              subjects={subjects} 
              profile={profile} 
              checklist={checklist} 
              announcements={announcements} 
              groups={groups}
              timetable={timetable} 
              resources={resources} 
              onSelectGroup={(group) => {
                setSelectedGroupFromDash(group);
                setActiveTab('groups');
              }}
              onToggleTheme={handleToggleTheme} // Pass theme handler
            />
          )}
          {activeTab === 'attendance' && <AttendanceTracker user={user} subjects={subjects} showToast={showToast} />}
          {activeTab === 'timetable' && <Timetable user={user} timetable={timetable} subjects={subjects} />}
          {activeTab === 'grades' && <GradeCalculator user={user} showToast={showToast} />}
          {activeTab === 'tasks' && <Checklist user={user} todos={checklist} />}
          {activeTab === 'groups' && (
            <Groups 
              user={user} 
              groups={groups} 
              initialGroup={selectedGroupFromDash}
              onClearInitialGroup={() => setSelectedGroupFromDash(null)}
              showToast={showToast}
              profile={profile}
            />
          )}
          {activeTab === 'resources' && <Resources user={user} showToast={showToast} />}
          {activeTab === 'announcements' && <Announcements user={user} announcements={announcements} showToast={showToast} />}
        </div>
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {showSettings && (
        <SettingsModal 
          user={user} 
          profile={profile} 
          onClose={() => setShowSettings(false)} 
          showToast={showToast}
        />
      )}
    </div>
  );
}
// these is the perfect code for the studnt portal.
