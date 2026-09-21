import React from 'react';
import PardonCalculatorView from './components/PardonCalculatorView';

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#06080B] text-[#F8FAFC] overflow-x-hidden selection:bg-cyan-500/25 selection:text-cyan-300">
      <main className="relative z-10 py-3 sm:py-4 px-3 sm:px-5 lg:px-6 max-w-[1600px] mx-auto">
        <PardonCalculatorView />
      </main>
    </div>
  );
}