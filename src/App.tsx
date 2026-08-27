import React from 'react';
import PardonCalculatorView from './components/PardonCalculatorView';

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#050507] text-[#f4f4f5] overflow-x-hidden selection:bg-white/20 selection:text-white">
      {/* BACKGROUND HANDLED BY CSS */}

      {/* MAIN CONTAINER */}
      <main className="relative z-10 py-6 sm:py-10 px-4 sm:px-8 max-w-[1600px] mx-auto">
        <PardonCalculatorView />
      </main>
    </div>
  );
}
