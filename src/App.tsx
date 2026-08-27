import React from 'react';
import PardonCalculatorView from './components/PardonCalculatorView';

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#0B0E14] text-[#F1F5F9] overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* MAIN CONTAINER */}
      <main className="relative z-10 py-5 sm:py-8 px-3 sm:px-6 lg:px-8 max-w-[1640px] mx-auto">
        <PardonCalculatorView />
      </main>
    </div>
  );
}

