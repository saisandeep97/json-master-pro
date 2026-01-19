'use client';

import { useState, useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { validateJson, formatJson, minifyJson, fixJson } from '@/lib/json-utils';
import toast, { Toaster } from 'react-hot-toast';
import { Play, AlignLeft, Minimize, Copy, Eraser, CheckCircle, AlertTriangle, AlertOctagon, Command, Sparkles } from 'lucide-react';

import ToolsPanel from './ToolsPanel';
import FileControls from './FileControls';

export default function JsonEditor() {
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const editorRef = useRef<any>(null);

    useEffect(() => {
        const saved = localStorage.getItem('json-master-input');
        if (saved) {
            setInput(saved);
            const { valid, error } = validateJson(saved);
            setStatus(valid ? 'valid' : 'invalid');
            setErrorMessage(error || '');
            if (valid) toast.success('Restored session', { duration: 2000, icon: '🔄' });
        }
    }, []);

    useEffect(() => {
        if (input) {
            localStorage.setItem('json-master-input', input);
        }

        if (!input.trim()) {
            setStatus('idle');
            setErrorMessage('');
            return;
        }
        const { valid, error } = validateJson(input);
        if (valid) {
            setStatus('valid');
            setErrorMessage('');
        } else {
            setStatus('invalid');
            setErrorMessage(error || 'Invalid JSON');
        }
    }, [input]);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
    };

    const handleFormat = () => {
        try {
            const formatted = formatJson(input);
            setInput(formatted);
            toast.success('Formatted', { icon: '✨' });
        } catch (e) {
            toast.error('Invalid JSON');
        }
    };

    const handleMinify = () => {
        try {
            const minified = minifyJson(input);
            setInput(minified);
            toast.success('Minified', { icon: '📦' });
        } catch (e) {
            toast.error('Invalid JSON');
        }
    };

    const handleFix = () => {
        const fixed = fixJson(input);
        if (fixed !== input) {
            setInput(fixed);
            toast.success('Auto-fixed errors', { icon: '🔧' });
        } else {
            toast('No fixes applied', { icon: 'ℹ️' });
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(input);
        toast.success('Copied input');
    };

    const handleClear = () => {
        if (confirm('Clear editor?')) {
            setInput('');
            localStorage.removeItem('json-master-input');
            toast.success('Cleared');
        }
    }

    return (
        <div className="flex flex-col h-full w-full gap-4 lg:gap-6" style={{ minHeight: '100%' }}>
            <Toaster position="bottom-right" toastOptions={{
                style: {
                    background: 'hsl(var(--color-surface))',
                    color: 'hsl(var(--color-text-main))',
                    border: '1px solid hsl(var(--color-border))',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px'
                }
            }} />

            {/* Main Toolbar */}
            <div className="card p-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[hsl(var(--color-surface))]/80 backdrop-blur-md">
                <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto no-scrollbar">
                    <div className={`
                        flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all duration-300 border
                        ${status === 'valid'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/10'
                            : status === 'invalid'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-lg shadow-rose-500/10 animate-pulse'
                                : 'bg-[hsl(var(--color-surface-hover))] border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]'}
                     `}>
                        {status === 'valid' && <CheckCircle size={16} />}
                        {status === 'invalid' && <AlertOctagon size={16} />}
                        {status === 'idle' && <Command size={16} />}
                        <span className="uppercase tracking-wider">{status === 'idle' ? 'Ready' : status === 'valid' ? 'Valid JSON' : 'Syntax Error'}</span>
                    </div>

                    <div className="w-px h-8 bg-[hsl(var(--color-border))] mx-2 hidden sm:block"></div>
                    <FileControls onLoadContent={setInput} currentContent={input} />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                        onClick={handleFix}
                        className="btn btn-primary gap-2 text-xs py-2 px-4 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 relative group overflow-hidden"
                        title="Auto Fix JSON"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer"></div>
                        <span className="relative flex items-center gap-2"><Sparkles size={16} /> Auto Fix</span>
                    </button>

                    <div className="w-px h-8 bg-[hsl(var(--color-border))] mx-2 hidden sm:block"></div>

                    <div className="flex bg-[hsl(var(--color-background))] rounded-lg p-1 border border-[hsl(var(--color-border))]">
                        <button onClick={handleFormat} className="icon-btn" disabled={status === 'invalid'} title="Format (Prettify)">
                            <AlignLeft size={18} />
                        </button>
                        <button onClick={handleMinify} className="icon-btn" disabled={status === 'invalid'} title="Minify (Compress)">
                            <Minimize size={18} />
                        </button>
                        <button onClick={handleCopy} className="icon-btn" title="Copy Input">
                            <Copy size={18} />
                        </button>
                        <button onClick={handleClear} className="icon-btn text-rose-400 hover:text-rose-500 hover:bg-rose-950/30" title="Clear All">
                            <Eraser size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
                {/* Input Pane */}
                <div className="flex flex-col card border-0 p-0 overflow-hidden relative group bg-[hsl(var(--color-background))]/50" style={{ height: '100%', minHeight: '500px' }}>
                    <div className="flex justify-between items-center text-xs font-medium text-[hsl(var(--color-text-muted))] px-4 py-2.5 bg-[hsl(var(--color-surface))] border-b border-[hsl(var(--color-border))]">
                        <span className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${status === 'invalid' ? 'bg-rose-500' : 'bg-indigo-500'} shadow-[0_0_8px_rgba(99,102,241,0.5)]`}></div>
                            INPUT
                        </span>
                        <span className="font-mono bg-[hsl(var(--color-background))] px-2 py-0.5 rounded text-[10px] border border-[hsl(var(--color-border))]">
                            {input.length.toLocaleString()} chars
                        </span>
                    </div>

                    <div className="flex-1 relative bg-[hsl(var(--color-background))]" style={{ minHeight: '400px', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                            <Editor
                                height="100%"
                                defaultLanguage="json"
                                theme="vs-dark"
                                value={input}
                                onChange={(value) => setInput(value || '')}
                                onMount={handleEditorDidMount}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                    wordWrap: 'on',
                                    formatOnPaste: true,
                                    automaticLayout: true,
                                    padding: { top: 20, bottom: 20 },
                                    scrollBeyondLastLine: false,
                                    renderLineHighlight: 'all',
                                    smoothScrolling: true,
                                    cursorBlinking: 'smooth',
                                    cursorSmoothCaretAnimation: 'on',
                                    guides: { indentation: true },
                                    scrollbar: { vertical: 'visible', verticalScrollbarSize: 10 }
                                }}
                            />
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="absolute bottom-4 left-4 right-4 p-3 bg-rose-500/10 text-rose-200 text-xs font-mono border border-rose-500/20 backdrop-blur-xl rounded-lg flex items-start gap-3 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                            <div className="break-all">{errorMessage}</div>
                        </div>
                    )}
                </div>

                {/* Tools Pane */}
                <div style={{ height: '100%', minHeight: '500px' }}>
                    <ToolsPanel jsonInput={input} isValid={status === 'valid'} />
                </div>
            </div>
        </div>
    );
}
