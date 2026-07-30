import React from 'react';
import { Scale, Sparkles, ShieldCheck } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading Consumer Grievance Platform..." 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-indigo-600 selection:text-white">
      
      {/* Subtle Background Glow Spheres */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col items-center space-y-6 max-w-sm mx-auto text-center z-10 animate-fadeIn">
        
        {/* Animated Brand Emblem & Spinner Ring */}
        <div className="relative flex items-center justify-center">
          
          {/* Outer Pulsing Aura */}
          <div className="absolute w-20 h-20 rounded-2xl bg-indigo-600/10 animate-pulseGlow" />

          {/* Smooth Dual Spinning Ring */}
          <div className="w-16 h-16 rounded-2xl border-2 border-indigo-100 border-t-indigo-600 border-r-indigo-600/40 animate-spin" />

          {/* Center Brand Icon */}
          <div className="absolute w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/25">
            <Scale className="w-6 h-6" />
          </div>

          {/* Sparkles Badge */}
          <div className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-white border border-slate-200 text-indigo-600 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
        </div>

        {/* Title & Badge */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">
              Grievance<span className="text-indigo-600">AI</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded-full font-semibold">
              RAG Platform
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {message}
          </p>
        </div>

        {/* Shimmering Progress Bar */}
        <div className="w-48 h-1.5 bg-slate-200/80 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 rounded-full animate-shimmer" />
        </div>

        {/* Sub-footer Tag */}
        <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 bg-white/80 border border-slate-200 px-3 py-1 rounded-full font-medium shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Consumer Protection Act 2019 Framework</span>
        </div>

      </div>

    </div>
  );
};
