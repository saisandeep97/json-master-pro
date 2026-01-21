'use client';

import { useRef, useState, useMemo } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { AlignLeft, Minimize, Copy, Eraser, Upload, Wand2, Braces, Network, Wrench, CheckCircle } from 'lucide-react';
import { formatJson, minifyJson } from '@/lib/json-utils';
import { fixJson } from '@/lib/json-fixer';
import toast from 'react-hot-toast';
import JsonTreeViewer from './JsonTreeViewer';
import { useGlobal } from '@/context/GlobalContext';

interface EditorPaneProps {
    title: string;
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
    headerColor?: string;
    onTransform?: () => void;
    onAutoFixOutput?: (result: string) => void;
    validationStatus?: 'idle' | 'valid' | 'invalid';
    hideToolbar?: boolean;
}

export default function EditorPane({
    title,
    value,
    onChange,
    readOnly = false,
    headerColor = 'emerald',
    onTransform,
    onAutoFixOutput,
    validationStatus = 'idle',
    hideToolbar = false
}: EditorPaneProps) {
    const { theme } = useGlobal();
    const editorRef = useRef<any>(null);
    const [viewMode, setViewMode] = useState<'code' | 'tree'>('code');

    // Color mapping
    const colors: Record<string, { dot: string; text: string }> = {
        emerald: { dot: 'bg-emerald-500', text: 'text-emerald-400' },
        indigo: { dot: 'bg-indigo-500', text: 'text-indigo-400' },
    };
    const color = colors[headerColor] || colors.emerald;

    // Parse JSON for Tree View
    const parsedData = useMemo(() => {
        if (viewMode !== 'tree') return null;
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }, [value, viewMode]);

    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor;
    };

    const handleChange = (val: string | undefined) => onChange(val || '');

    const handleFormat = () => {
        try {
            onChange(formatJson(value));
            toast.success('Formatted');
        } catch {
            toast.error('Invalid JSON');
        }
    };

    const handleMinify = () => {
        try {
            onChange(minifyJson(value));
            toast.success('Minified');
        } catch {
            toast.error('Invalid JSON');
        }
    };

    const handleAutoFix = () => {
        const fixed = fixJson(value);
        if (fixed === value) {
            toast('No obvious fixes found', { icon: '🤔' });
        } else if (onAutoFixOutput) {
            onAutoFixOutput(fixed);
            toast.success('Fixed JSON placed in Result panel');
        } else {
            onChange(fixed);
            toast.success('Auto-fix applied');
        }
    };

    const handleValidate = () => {
        if (!value.trim()) {
            toast('Empty input', { icon: '📝' });
            return;
        }
        try {
            JSON.parse(value);
            toast.success('Valid JSON ✓');
        } catch (e: any) {
            toast.error(e.message || 'Invalid JSON', { duration: 5000 });
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        toast.success('Copied');
    };

    const handleClear = () => {
        onChange('');
        toast.success('Cleared');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            onChange(e.target?.result as string);
            toast.success('File loaded');
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <div className="h-full w-full flex flex-col rounded-xl border border-slate-700 overflow-hidden bg-slate-900">
            {/* Toolbar */}
            {!hideToolbar && (
                <div className="flex justify-between items-center px-4 py-2.5 bg-slate-800 border-b border-slate-700 shrink-0">
                    {/* Left: Title + View Toggle */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${color.dot} shadow-lg`}></div>
                            <span className={`font-bold text-xs uppercase tracking-wider ${color.text}`}>
                                {title}
                            </span>
                        </div>

                        <div className="h-4 w-px bg-slate-700"></div>

                        <div className="flex bg-slate-900 rounded-md p-0.5 border border-slate-700">
                            <button
                                onClick={() => setViewMode('code')}
                                className={`px-2.5 py-1 text-[10px] rounded flex items-center gap-1.5 transition-all ${viewMode === 'code'
                                        ? 'bg-slate-700 text-white font-bold'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                <Braces size={13} /> Code
                            </button>
                            <button
                                onClick={() => setViewMode('tree')}
                                className={`px-2.5 py-1 text-[10px] rounded flex items-center gap-1.5 transition-all ${viewMode === 'tree'
                                        ? 'bg-slate-700 text-white font-bold'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                <Network size={13} /> Tree
                            </button>
                        </div>
                    </div>

                    {/* Right: Tools */}
                    <div className="flex items-center gap-3">
                        {validationStatus === 'invalid' && (
                            <button
                                onClick={handleAutoFix}
                                className="h-7 px-3 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/30 rounded-md text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 transition-all"
                            >
                                <Wrench size={12} /> Auto Fix
                            </button>
                        )}

                        {/* Tool Buttons */}
                        <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700 p-0.5">
                            <button onClick={handleValidate} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors" title="Validate">
                                <CheckCircle size={17} />
                            </button>
                            <div className="w-px h-4 bg-slate-700 mx-0.5"></div>
                            <button onClick={handleFormat} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors" title="Format">
                                <AlignLeft size={17} />
                            </button>
                            <div className="w-px h-4 bg-slate-700 mx-0.5"></div>
                            <button onClick={handleMinify} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors" title="Minify">
                                <Minimize size={17} />
                            </button>
                            {onTransform && (
                                <>
                                    <div className="w-px h-4 bg-slate-700 mx-0.5"></div>
                                    <button onClick={onTransform} className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors" title="Transform">
                                        <Wand2 size={17} />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="h-4 w-px bg-slate-700"></div>

                        {/* Meta Actions */}
                        <div className="flex items-center gap-1">
                            <label className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md cursor-pointer transition-colors" title="Load File">
                                <input type="file" className="hidden" accept=".json,.txt" onChange={handleFileUpload} />
                                <Upload size={16} />
                            </label>
                            <button onClick={handleCopy} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors" title="Copy">
                                <Copy size={16} />
                            </button>
                            <button onClick={handleClear} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors" title="Clear">
                                <Eraser size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Editor Area */}
            <div className="flex-1 relative min-h-0 bg-slate-950">
                <div className="absolute inset-0">
                    {viewMode === 'code' ? (
                        <Editor
                            height="100%"
                            defaultLanguage="json"
                            theme={theme === 'dark' ? 'vs-dark' : 'light'}
                            value={value}
                            onChange={handleChange}
                            onMount={handleEditorDidMount}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                wordWrap: 'on',
                                formatOnPaste: true,
                                readOnly,
                                automaticLayout: true,
                                padding: { top: 10, bottom: 10 },
                                scrollBeyondLastLine: false,
                                renderLineHighlight: 'all',
                                smoothScrolling: true,
                                lineNumbers: 'on',
                                folding: true,
                            }}
                        />
                    ) : (
                        <div className="h-full w-full overflow-auto p-4">
                            {parsedData ? (
                                <JsonTreeViewer data={parsedData} />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                                    <Braces size={32} />
                                    <span className="text-sm">Invalid JSON. Switch to Code view to fix errors.</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
