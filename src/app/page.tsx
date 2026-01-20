'use client';

import JsonEditor from '@/components/JsonEditor';
import Sidebar from '@/components/Sidebar';
import { Terminal, Shield, Settings, Moon, Sun, Download, Upload } from 'lucide-react';
import { useGlobal } from '@/context/GlobalContext';

export default function Home() {
  const { theme, toggleTheme } = useGlobal();

  return (
    <div className="flex flex-col h-screen bg-[hsl(var(--color-background))] text-[hsl(var(--color-text-main))] selection:bg-indigo-500/30 overflow-hidden">

      {/* Header */}
      <header className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))]/80 backdrop-blur-md shrink-0 z-50">
        <div className="w-full max-w-[1920px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
              <div className="relative w-8 h-8 bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] rounded-lg flex items-center justify-center font-bold text-white shadow-xl">
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-pink-500 text-xs">JM</span>
              </div>
            </div>

            <div className="flex flex-col">
              <h1 className="font-bold text-sm tracking-tight leading-none">
                JSON Master <span className="text-[hsl(var(--color-accent))]">Pro</span>
              </h1>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <button className="btn btn-ghost gap-2 text-xs">
              <Upload size={14} /> Load Data
            </button>
            <button className="btn btn-primary gap-2 text-xs">
              <Download size={14} /> Download
            </button>
            <div className="w-px h-6 bg-[hsl(var(--color-border))] mx-2"></div>
            <button className="icon-btn" title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`} onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Workspace */}
      <div
        className="flex-1 flex overflow-hidden w-full max-w-[1920px] mx-auto relative"
        style={{ flex: '1 1 0%', minHeight: 0 }}
      >
        <Sidebar />

        <main
          className="flex-1 flex flex-col min-h-0 relative bg-[hsl(var(--color-background))]"
          style={{ flex: '1 1 0%', minHeight: 0 }}
        >
          <JsonEditor />
        </main>
      </div>

      {/* Footer - Replaced by StatusBar mostly, but keeping generic copyright if needed or removing */}
    </div>
  );
}
