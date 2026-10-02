import React from 'react';
import { Shirt, ShieldCheck, Loader2 } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col items-center justify-center p-4 text-white font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex flex-col items-center max-w-sm text-center space-y-4 animate-in fade-in duration-300">
        
        {/* Animated Brand Logo */}
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-2xl shadow-blue-500/30">
            <Shirt className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            FreshPress POS
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Laundry & Dry Cleaning Billing System
          </p>
        </div>

        {/* Loading Spinner & Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 mt-4">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
          <span>Verifying secure Firebase session...</span>
        </div>

      </div>
    </div>
  );
}
