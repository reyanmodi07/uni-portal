
import React, { useState } from 'react';
// Casting motion to any to avoid "Property does not exist" errors in this environment
import { motion as m } from 'framer-motion';
const motion = m as any;
import { Mail, Lock, User, ArrowRight, Chrome, Loader2 } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-black relative overflow-hidden font-sans selection:bg-orange-500/30 selection:text-orange-900 dark:selection:text-orange-100">
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

       <div className="z-10 w-full max-w-md p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
          >
             <div className="p-8">
                <div className="text-center mb-8">
                   <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-24 h-24 bg-[#FF5722] mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-orange-500/30"
                      style={{ borderRadius: '40% 60% 60% 40% / 40% 50% 50% 60%' }}
                   >
                      <span className="text-white font-black text-2xl tracking-tight">FORUS</span>
                   </motion.div>
                   <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">
                     {isLogin ? 'Welcome Back' : 'Get Started'}
                   </h1>
                   <p className="text-zinc-500 dark:text-zinc-400">
                     {isLogin ? 'Enter your credentials to access the portal' : 'Start your academic journey with us today'}
                   </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                   {!isLogin && (
                      <div className="space-y-1">
                         <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Full Name</label>
                         <div className="relative">
                            <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input 
                              type="text"
                              className="w-full bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all dark:text-white font-medium"
                              placeholder="John Doe"
                              required={!isLogin}
                            />
                         </div>
                      </div>
                   )}
                   
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Email Address</label>
                      <div className="relative">
                         <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                         <input 
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="w-full bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all dark:text-white font-medium"
                           placeholder="student@university.edu"
                           required
                         />
                      </div>
                   </div>

                   <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Password</label>
                      <div className="relative">
                         <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                         <input 
                           type="password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="w-full bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all dark:text-white font-medium"
                           placeholder="••••••••"
                           required
                         />
                      </div>
                   </div>

                   {isLogin && (
                     <div className="flex justify-end">
                        <button type="button" className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline">Forgot Password?</button>
                     </div>
                   )}

                   <button 
                     type="submit" 
                     disabled={isLoading}
                     className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                   >
                     {isLoading ? (
                       <Loader2 className="w-5 h-5 animate-spin" />
                     ) : (
                       <>
                         {isLogin ? 'Sign In' : 'Create Account'}
                         <ArrowRight className="w-5 h-5" />
                       </>
                     )}
                   </button>
                </form>

                <div className="relative my-8">
                   <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                   </div>
                   <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-zinc-900 px-4 text-zinc-500 font-bold">Or continue with</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => handleSubmit({ preventDefault: () => {} } as any)}
                     className="flex items-center justify-center gap-2 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors dark:text-white font-medium text-sm"
                   >
                      <Chrome className="w-4 h-4" /> Google
                   </button>
                   <button 
                     onClick={() => handleSubmit({ preventDefault: () => {} } as any)}
                     className="flex items-center justify-center gap-2 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors dark:text-white font-medium text-sm"
                   >
                      <User className="w-4 h-4" /> Guest
                   </button>
                </div>
             </div>
             
             <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 text-center border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-sm text-zinc-500">
                   {isLogin ? "Don't have an account?" : "Already have an account?"}
                   <button 
                     onClick={() => setIsLogin(!isLogin)}
                     className="ml-2 font-bold text-orange-600 dark:text-orange-400 hover:underline"
                   >
                      {isLogin ? 'Sign Up' : 'Sign In'}
                   </button>
                </p>
             </div>
          </motion.div>
       </div>
    </div>
  );
};

export default Auth;
