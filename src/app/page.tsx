import JsonEditor from '@/components/JsonEditor';
import { Terminal, Shield, Settings } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col h-full bg-[hsl(var(--color-background))] text-[hsl(var(--color-text-main))] selection:bg-indigo-500/30">

      {/* Header */}
      <header className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))]/80 backdrop-blur-md shrink-0 z-50">
        <div className="w-full max-w-[1920px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
              <div className="relative w-10 h-10 bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] rounded-lg flex items-center justify-center font-bold text-white shadow-xl">
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-pink-500">JM</span>
              </div>
            </div>

            <div className="flex flex-col">
              <h1 className="font-bold text-lg tracking-tight leading-none">
                JSON Master <span className="text-[hsl(var(--color-accent))]">Pro</span>
              </h1>
              <span className="text-[10px] font-medium text-[hsl(var(--color-text-muted))] uppercase tracking-wider">Developer Suite</span>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            <button className="icon-btn" title="Settings">
              <Settings size={18} />
            </button>
            <div className="w-px h-6 bg-[hsl(var(--color-border))] mx-2"></div>
            <a href="#" className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-[hsl(var(--color-text-secondary))] hover:bg-[hsl(var(--color-surface-hover))] transition-colors border border-transparent hover:border-[hsl(var(--color-border))]">
              <Shield size={14} className="text-emerald-400" />
              <span>v2.1.0</span>
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 w-full max-w-[1920px] mx-auto p-4 lg:p-6 overflow-hidden">
        <JsonEditor />
      </main>

      {/* Footer - Minimal */}
      <footer className="shrink-0 py-2 text-center text-[10px] text-[hsl(var(--color-text-muted))] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
        SECURE LOCAL ENVIRONMENT • NO DATA LEAVES YOUR DEVICE
      </footer>
    </div>
  );
}
