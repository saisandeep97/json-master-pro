'use client';

import { useState, useMemo } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import toast, { Toaster } from 'react-hot-toast';
import { X, ArrowRight, Check, Sparkles } from 'lucide-react';
import { useGlobal } from '@/context/GlobalContext';

import EditorPane from './EditorPane';
import StatusBar from './StatusBar';
import TransformModal from './TransformModal';

// Default sample JSON
const DEFAULT_JSON = `{
  "name": "JSON Master Pro",
  "version": "1.0.0",
  "features": [
    "Format & Validate",
    "Transform & Filter",
    "Compare & Diff"
  ],
  "settings": {
    "theme": "dark",
    "autoFormat": true
  }
}`;

const safeParse = (input: string) => {
    try {
        return JSON.parse(input);
    } catch {
        return null;
    }
};

const useValidation = (json: string) => {
    return useMemo(() => {
        if (!json.trim()) return { status: 'idle' as const, error: '' };
        try {
            JSON.parse(json);
            return { status: 'valid' as const, error: '' };
        } catch (e: any) {
            return { status: 'invalid' as const, error: e.message };
        }
    }, [json]);
};

export default function JsonEditor() {
    const { layoutMode, theme } = useGlobal();
    const [input, setInput] = useState(DEFAULT_JSON);
    const [resultInput, setResultInput] = useState('');
    const [showResult, setShowResult] = useState(false);

    // For diff view - second input
    const [diffInput, setDiffInput] = useState('');

    // Validation
    const inputVal = useValidation(input);
    const resultVal = useValidation(resultInput);
    const diffVal = useValidation(diffInput);

    // Transform State
    const [transformOpen, setTransformOpen] = useState(false);

    // Stats
    const inputStats = useMemo(() => {
        const bytes = new Blob([input]).size;
        const size = bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
        return { size, length: input.length };
    }, [input]);

    const resultStats = useMemo(() => {
        const bytes = new Blob([resultInput]).size;
        const size = bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
        return { size, length: resultInput.length };
    }, [resultInput]);

    // Handle transform result - opens result panel
    const handleTransformApply = (result: string) => {
        setResultInput(result);
        setShowResult(true);
    };

    // Handle auto-fix output
    const handleAutoFixOutput = (fixed: string) => {
        setResultInput(fixed);
        setShowResult(true);
    };

    // Use result as main input
    const handleUseResult = () => {
        setInput(resultInput);
        setShowResult(false);
        setResultInput('');
        toast.success('Result applied to editor');
    };

    // Close result panel
    const handleCloseResult = () => {
        setShowResult(false);
    };

    // Open transform
    const openTransform = () => {
        if (!safeParse(input)) {
            toast.error('Invalid JSON - cannot transform');
            return;
        }
        setTransformOpen(true);
    };

    // Monaco theme based on global theme
    const monacoTheme = theme === 'dark' ? 'vs-dark' : 'light';

    return (
        <div className="flex flex-col h-full w-full overflow-hidden">
            <Toaster position="bottom-right" toastOptions={{
                style: {
                    background: theme === 'dark' ? '#1e293b' : '#fff',
                    color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
                    border: '1px solid',
                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px'
                }
            }} />

            <TransformModal
                isOpen={transformOpen}
                onClose={() => setTransformOpen(false)}
                data={safeParse(input)}
                onApply={handleTransformApply}
            />

            {/* Main Editor Area */}
            <div
                className="relative flex-1 min-h-0 p-3"
                style={{ height: 'calc(100% - 32px)' }}
            >
                {layoutMode === 'diff' ? (
                    /* Diff View - Monaco DiffEditor for proper highlighting */
                    <div className="h-full rounded-xl border border-slate-700 overflow-hidden bg-slate-900">
                        <div className="flex items-center px-4 py-2 bg-slate-800 border-b border-slate-700 gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Original</span>
                            </div>
                            <div className="flex-1 text-center text-xs text-slate-500">← differences are highlighted →</div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Modified</span>
                            </div>
                        </div>
                        <div className="h-[calc(100%-40px)]">
                            <DiffEditor
                                height="100%"
                                language="json"
                                theme={monacoTheme}
                                original={input}
                                modified={diffInput}
                                onMount={(editor) => {
                                    // Get the modified editor and set onChange
                                    const modifiedEditor = editor.getModifiedEditor();
                                    modifiedEditor.onDidChangeModelContent(() => {
                                        setDiffInput(modifiedEditor.getValue());
                                    });
                                    // Set initial value if empty
                                    if (!diffInput) {
                                        setDiffInput(input);
                                    }
                                }}
                                options={{
                                    renderSideBySide: true,
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    readOnly: false,
                                    originalEditable: true,
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    /* Single Editor (default) + Result Panel */
                    <div className="h-full flex gap-3">
                        {/* Main Editor */}
                        <div className={`${showResult ? 'w-1/2' : 'w-full'} min-w-0 transition-all duration-300`}>
                            <EditorPane
                                title="JSON Editor"
                                value={input}
                                onChange={setInput}
                                headerColor="emerald"
                                onTransform={openTransform}
                                onAutoFixOutput={handleAutoFixOutput}
                                validationStatus={inputVal.status}
                            />
                        </div>

                        {/* Result Panel - slides in when needed */}
                        {showResult && (
                            <div className="w-1/2 min-w-0 animate-in slide-in-from-right duration-300">
                                <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
                                    {/* Result Header */}
                                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={18} />
                                            <span className="font-bold text-sm">Result</span>
                                            {resultVal.status === 'valid' && (
                                                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <Check size={12} /> Valid
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleUseResult}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
                                            >
                                                <ArrowRight size={14} /> Use This
                                            </button>
                                            <button
                                                onClick={handleCloseResult}
                                                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Result Editor */}
                                    <div className="flex-1 min-h-0">
                                        <EditorPane
                                            title=""
                                            value={resultInput}
                                            onChange={setResultInput}
                                            headerColor="indigo"
                                            validationStatus={resultVal.status}
                                            hideToolbar
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <StatusBar
                leftStatus={inputVal.status}
                leftError={inputVal.error}
                rightStatus={showResult ? resultVal.status : diffVal.status}
                rightError={showResult ? resultVal.error : diffVal.error}
                leftStats={inputStats}
                rightStats={showResult ? resultStats : undefined}
            />
        </div>
    );
}
