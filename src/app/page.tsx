'use client';

import JsonEditor from '@/components/JsonEditor';
import Sidebar from '@/components/Sidebar';
import { Download, Upload } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 overflow-hidden">

      {/* Header - Clean, no duplicate logo */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md shrink-0 z-50">
        <div className="w-full px-4 h-12 flex items-center justify-between">
          <h1 className="font-bold text-sm tracking-tight">
            JSON Master <span className="text-indigo-400">Pro</span>
          </h1>

          <nav className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Upload size={14} /> Load
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25">
              <Download size={14} /> Export
            </button>
          </nav>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative" style={{ minHeight: 0 }}>
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-0 relative bg-slate-950" style={{ minHeight: 0 }}>
          <JsonEditor />
        </main>
      </div>
    </div>
  );
}
