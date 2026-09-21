import React from 'react';
import PardonCalculatorView from './components/PardonCalculatorView';

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#06080B] text-[#F8FAFC] overflow-x-hidden selection:bg-cyan-500/25 selection:text-cyan-300">
      <main className="relative z-10 py-4 sm:py-6 px-4 sm:px-6 lg:px-8 xl:px-10 w-full max-w-[1920px] mx-auto">
        <PardonCalculatorView />
      </main>
    </div>
  );
}