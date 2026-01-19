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
            <div className="card panel-header">
                <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-primary flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-pink-500"></div>
                        JSON Master v2
                    </span>
                    <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded transition-colors duration-300 border ${status === 'valid' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            status === 'invalid' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'border-transparent text-muted'
                        }`}>
                        {status === 'valid' && <CheckCircle size={14} />}
                        {status === 'invalid' && <AlertTriangle size={14} />}
                        {status === 'idle' ? 'Ready' : status === 'valid' ? 'Valid' : 'Invalid'}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <FileControls onLoadContent={setInput} currentContent={input} />

                    <button onClick={handleFix} className="btn btn-primary gap-2" title="Auto Fix JSON">
                        <Play size={16} fill="currentColor" /> Fix
                    </button>
                    <div className="w-px h-6 bg-slate-700 mx-2"></div>
                    <button onClick={handleFormat} className="btn btn-ghost gap-2" disabled={status === 'invalid'} title="Format (Prettify)">
                        <AlignLeft size={16} /> Beautify
                    </button>
                    <button onClick={handleMinify} className="btn btn-ghost gap-2" disabled={status === 'invalid'} title="Minify (Compress)">
                        <Minimize size={16} /> Minify
                    </button>
                    <button onClick={handleCopy} className="btn btn-ghost gap-2" title="Copy Input">
                        <Copy size={16} /> Copy
                    </button>
                    <button onClick={handleClear} className="btn btn-ghost text-red-400 hover:text-red-300 gap-2" title="Clear All">
                        <Eraser size={16} />
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[600px]">
                {/* Input Pane */}
                <div className="flex flex-col gap-2 h-full card border-0 p-0 overflow-hidden relative group">
                    <div className="flex justify-between items-center text-sm text-muted px-4 py-2 bg-slate-800/80 border-b border-slate-700">
                        <span>Input</span>
                        <span className="font-mono text-xs">{input.length} chars</span>
                    </div>

                    <div className="flex-1 relative bg-slate-950">
                        <Editor
                            height="100%"
                            defaultLanguage="json"
                            theme="vs-dark"
                            value={input}
                            onChange={(value) => setInput(value || '')}
                            onMount={handleEditorDidMount}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                wordWrap: 'on',
                                formatOnPaste: true,
                                automaticLayout: true,
                                padding: { top: 16 },
                                scrollBeyondLastLine: false,
                                renderLineHighlight: 'none',
                            }}
                        />
                    </div>

                    {errorMessage && (
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-red-900/90 text-red-200 text-xs font-mono border-t border-red-500/30 backdrop-blur-md">
                            {errorMessage}
                        </div>
                    )}
                </div>

                {/* Tools Pane (Output/Convert/Generate) */}
                <ToolsPanel jsonInput={input} isValid={status === 'valid'} />
            </div>

            <AdBanner />
        </div>
    );
}
