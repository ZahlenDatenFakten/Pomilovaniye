import React from 'react';
import PardonCalculatorView from './components/PardonCalculatorView';

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#08090e] text-[#f1f4fb] overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* AMBIENT GLOW BACKDROPS (FROSTED GLASS EFFECT) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[20%] left-[10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute top-[30%] -right-[10%] w-[650px] h-[650px] rounded-full bg-amber-600/8 blur-[160px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[700px] h-[700px] rounded-full bg-indigo-600/10 blur-[180px]" />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
        <PardonCalculatorView />
      </main>
    </div>
  );
}