import React, { useState } from 'react';
import { TempleGame } from './components/TempleGame';
import { PromptViewer } from './components/PromptViewer';
import { GitHubGuide } from './components/GitHubGuide';
import { Sparkles, FileText, Compass, Github, BookOpen, Layers } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'prompt' | 'game' | 'guide'>('prompt');

  return (
    <div className="flex flex-col h-screen w-screen bg-stone-950 text-stone-100 overflow-hidden select-none font-sans">
      {/* Top Navigation Header */}
      <header className="h-14 border-b border-stone-800 bg-stone-900/90 backdrop-blur-md px-3 md:px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-lg shadow-md border border-amber-300/40">
            🪷
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-sm md:text-base text-amber-200 tracking-wide">
                Chùa Online 3D
              </h1>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 font-mono">
                Bản GitHub & Claude Code
              </span>
            </div>
            <p className="text-[10px] text-stone-400 hidden md:block">
              Chuẩn hóa Prompt cho GitHub • Trải nghiệm 3D Three.js trực tiếp
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-stone-950/60 p-1 rounded-xl border border-stone-800">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'prompt'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Prompt GitHub</span>
          </button>

          <button
            onClick={() => setActiveTab('game')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'game'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Trải Nghiệm 3D</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'guide'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hướng Dẫn Git</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full h-[calc(100vh-3.5rem)] overflow-y-auto relative bg-stone-950">
        {activeTab === 'prompt' && <PromptViewer />}
        {activeTab === 'game' && <TempleGame />}
        {activeTab === 'guide' && <GitHubGuide />}
      </main>
    </div>
  );
}
