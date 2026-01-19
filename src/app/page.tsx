import JsonEditor from '@/components/JsonEditor';

export default function Home() {
  return (
    <div className="flex flex-col h-full bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm shrink-0">
        <div className="w-full px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-glow">
              JM
            </div>
            <h1 className="font-bold text-lg tracking-tight text-slate-100 hidden sm:block">JSON Master <span className="text-pink-500">Pro</span></h1>
          </div>
          <nav className="flex gap-4 text-sm font-medium text-slate-400">
            {/* Nav items can be re-added later if needed */}
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0 w-full max-w-[1920px] mx-auto p-4">
        <JsonEditor />
      </main>

      <footer className="border-t border-slate-800 py-2 text-center text-slate-600 text-xs shrink-0">
        <p>JSON Master Pro v2.0 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
