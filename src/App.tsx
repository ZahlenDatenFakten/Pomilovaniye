import React from 'react';
import PardonCalculatorView from './components/PardonCalculatorView';

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#06080B] text-[#F8FAFC] overflow-x-hidden selection:bg-cyan-500/25 selection:text-cyan-300">
      <main className="relative z-10 py-4 sm:py-5 px-4 sm:px-6 w-full max-w-[1440px] mx-auto">
        <PardonCalculatorView />
      </main>
    </div>
  );
}