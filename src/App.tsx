import React from 'react';
import PardonCalculatorView from './components/PardonCalculatorView';

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#000000] text-[#EDEDED] overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-300">
      <main className="relative z-10 py-3 sm:py-5 px-3 sm:px-5 lg:px-6 max-w-[1600px] mx-auto">
        <PardonCalculatorView />
      </main>
    </div>
  );
}