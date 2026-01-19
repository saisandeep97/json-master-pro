'use client';

import { useState, useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { validateJson, formatJson, minifyJson, fixJson } from '@/lib/json-utils';
import JSON5 from 'json5';
import toast, { Toaster } from 'react-hot-toast';
import { Play, AlignLeft, Minimize, Copy, Eraser, CheckCircle, AlertTriangle } from 'lucide-react';

import AdBanner from './AdBanner';
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
        <div className="flex flex-col h-full gap-4">
            <Toaster position="bottom-right" toastOptions={{
                style: {
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid #334155'
                }
            }} />

            {/* Toolbar */}
            <div className="card panel-header shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-4 w-full">
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-colors duration-300 border ${status === 'valid' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            status === 'invalid' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-slate-800/50 border-slate-700 text-slate-400'
                            }`}>
                            {status === 'valid' && <CheckCircle size={14} />}
                            {status === 'invalid' && <AlertTriangle size={14} />}
                            {status === 'idle' ? 'Ready' : status === 'valid' ? 'Valid JSON' : 'Invalid JSON'}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto">
                        <FileControls onLoadContent={setInput} currentContent={input} />
                        <div className="w-px h-6 bg-slate-700 mx-1"></div>

                        <button onClick={handleFix} className="btn btn-primary gap-2 shadow-lg shadow-indigo-500/20" title="Auto Fix JSON">
                            <Play size={16} fill="currentColor" /> <span className="hidden sm:inline">Fix</span>
                        </button>
                        <div className="w-px h-6 bg-slate-700 mx-2 hidden sm:block"></div>

                        <div className="flex bg-slate-800/50 rounded-lg p-1">
                            <button onClick={handleFormat} className="btn btn-ghost p-2 hover:bg-slate-700 rounded" disabled={status === 'invalid'} title="Format (Prettify)">
                                <AlignLeft size={18} />
                            </button>
                            <button onClick={handleMinify} className="btn btn-ghost p-2 hover:bg-slate-700 rounded" disabled={status === 'invalid'} title="Minify (Compress)">
                                <Minimize size={18} />
                            </button>
                            <button onClick={handleCopy} className="btn btn-ghost p-2 hover:bg-slate-700 rounded" title="Copy Input">
                                <Copy size={18} />
                            </button>
                            <button onClick={handleClear} className="btn btn-ghost p-2 hover:bg-red-900/30 text-red-400 rounded" title="Clear All">
                                <Eraser size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Input Pane */}
                <div className="flex flex-col h-full card border-0 p-0 overflow-hidden relative group bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 shadow-xl">
                    <div className="flex justify-between items-center text-xs font-medium text-slate-400 px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Input</span>
                        <span className="font-mono opacity-70">{input.length} chars</span>
                    </div>

                    <div className="flex-1 relative min-h-0">
                        <div className="absolute inset-0">
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
                                    padding: { top: 16, bottom: 16 },
                                    scrollBeyondLastLine: false,
                                    renderLineHighlight: 'all',
                                    smoothScrolling: true,
                                    cursorBlinking: 'smooth',
                                    cursorSmoothCaretAnimation: 'on'
                                }}
                            />
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-red-500/10 text-red-200 text-xs font-mono border-t border-red-500/20 backdrop-blur-md flex items-center gap-2">
                            <AlertTriangle size={14} className="text-red-400" />
                            {errorMessage}
                        </div>
                    )}
                </div>

                {/* Tools Pane */}
                <div className="h-full min-h-[300px] lg:min-h-0 bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 shadow-xl rounded-xl overflow-hidden">
                    <ToolsPanel jsonInput={input} isValid={status === 'valid'} />
                </div>
            </div>
        </div>
    );
}
