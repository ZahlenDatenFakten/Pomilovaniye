import React from 'react';
import PardonCalculatorView from './components/PardonCalculatorView';

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#050507] text-[#f4f4f5] overflow-x-hidden selection:bg-white/20 selection:text-white">
      {/* VIBRANT APPLE-STYLE MESH GRADIENT */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen opacity-50 animate-pulse-slow" />
        <div className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-cyan-500/10 blur-[140px] mix-blend-screen opacity-60" />
        <div className="absolute bottom-[-20%] left-[20%] w-[80vw] h-[80vw] rounded-full bg-purple-600/15 blur-[160px] mix-blend-screen opacity-50" />
        {/* Subtle noise/grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 py-6 sm:py-10 px-4 sm:px-8 max-w-[1600px] mx-auto">
        <PardonCalculatorView />
      </main>
    </div>
  );
}
