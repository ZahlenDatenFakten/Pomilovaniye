import React from 'react';
import PardonCalculatorView from './components/PardonCalculatorView';

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#050507] text-[#f4f4f5] overflow-x-hidden selection:bg-white/20 selection:text-white">
      {/* MONOCHROME AMBIENT GLOWS */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[15%] left-[20%] w-[550px] h-[550px] rounded-full bg-white/[0.02] blur-[140px]" />
        <div className="absolute top-[35%] right-[10%] w-[600px] h-[600px] rounded-full bg-white/[0.015] blur-[160px]" />
        <div className="absolute -bottom-[10%] left-[30%] w-[650px] h-[650px] rounded-full bg-white/[0.02] blur-[180px]" />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '28px 28px'
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
