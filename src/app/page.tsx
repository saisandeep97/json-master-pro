import JsonEditor from '@/components/JsonEditor';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-glow">
              JM
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-100">JSON Master <span className="text-pink-500">Pro</span></h1>
          </div>
          <nav className="flex gap-4 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-indigo-400 transition-colors">Validator</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Converter</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Diff</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 container py-8">
        {/* Introduction / SEO Text could go here */}
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">
            The Ultimate JSON Toolkit
          </h2>
          <p className="text-slate-400">
            Validate, Format, Minify and Fix your JSON data instantly. Secure, client-side, and ad-supported.
          </p>
        </div>

        <JsonEditor />
      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} JSON Master Pro. Built for developers.</p>
      </footer>
    </div>
  );
}
