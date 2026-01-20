'use client';

import { useRef, useState, useMemo } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { AlignLeft, Minimize, Copy, Eraser, Command, Upload, Download, Wand2, Braces, Network, Wrench } from 'lucide-react';
import { formatJson, minifyJson } from '@/lib/json-utils';
import { fixJson } from '@/lib/json-fixer';
import toast from 'react-hot-toast';
import JsonTreeViewer from './JsonTreeViewer';

interface EditorPaneProps {
    title: string;
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
    headerColor?: string;
    onLoadFile?: (content: string) => void;
    onTransform?: () => void;
    validationStatus?: 'idle' | 'valid' | 'invalid';
}

export default function EditorPane({ title, value, onChange, readOnly = false, headerColor = 'indigo', onLoadFile, onTransform, validationStatus = 'idle' }: EditorPaneProps) {
    const editorRef = useRef<any>(null);
    const [viewMode, setViewMode] = useState<'code' | 'tree'>('code');

    // Safe Color Mapping for Tailwind
    const colorMap: Record<string, string> = {
        indigo: 'text-indigo-400 bg-indigo-500',
        emerald: 'text-emerald-400 bg-emerald-500',
        amber: 'text-amber-400 bg-amber-500',
        rose: 'text-rose-400 bg-rose-500',
    };

    // Extract text/bg colors safely
    const themeClass = colorMap[headerColor] || colorMap['indigo'];
    const textColor = themeClass.split(' ')[0];
    const bgColor = themeClass.split(' ')[1];

    // ... (rest of logic)

    // Parse JSON for Tree View
    const parsedData = useMemo(() => {
        if (viewMode !== 'tree') return null;
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }, [value, viewMode]);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
    };

    const handleChange = (val: string | undefined) => {
        onChange(val || '');
    };

    const handleFormat = () => {
        try {
            const formatted = formatJson(value);
            onChange(formatted);
            toast.success('Formatted');
        } catch {
            toast.error('Invalid JSON');
        }
    };

    const handleMinify = () => {
        try {
            const minified = minifyJson(value);
            onChange(minified);
            toast.success('Minified');
        } catch {
            toast.error('Invalid JSON');
        }
    };

    const handleAutoFix = () => {
        const fixed = fixJson(value);
        if (fixed === value) {
            toast('No obvious fixes found', { icon: '🤔' });
        } else {
            onChange(fixed);
            toast.success('Auto-fix applied');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        toast.success('Copied');
    };

    const handleClear = () => {
        if (confirm('Clear this editor?')) {
            onChange('');
            toast.success('Cleared');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (onLoadFile) onLoadFile(content);
            else onChange(content);
            toast.success('File loaded');
        };
        reader.readAsText(file);
        // Reset input
        e.target.value = '';
    };

    return (
        <div
            className="card border-0 p-0 overflow-hidden group bg-[hsl(var(--color-background))]/50"
            style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative' }}
        >
            {/* Header / Toolbar */}
            <div
                className={`flex justify-between items-center px-4 py-2 bg-[hsl(var(--color-surface))] border-b border-[hsl(var(--color-border))]`}
                style={{ flexShrink: 0, height: '42px' }}
            >
                {/* Title and Status */}
                <div className="flex items-center gap-3">
                    <span className={`font-bold text-xs uppercase tracking-wider flex items-center gap-2 ${textColor}`}>
                        <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)] ${bgColor}`}></div>
                        {title}
                    </span>

                    <div className="flex bg-[hsl(var(--color-background))] rounded p-1 border border-[hsl(var(--color-border))] ml-2">
                        <button
                            onClick={() => setViewMode('code')}
                            className={`px-2 py-0.5 text-[10px] rounded transition-all ${viewMode === 'code' ? 'bg-[hsl(var(--color-surface-hover))] text-[hsl(var(--color-text-main))] font-bold shadow-sm' : 'text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text-main))]'}`}
                            title="Code View"
                        >
                            <Braces size={12} />
                        </button>
                        <button
                            onClick={() => setViewMode('tree')}
                            className={`px-2 py-0.5 text-[10px] rounded transition-all ${viewMode === 'tree' ? 'bg-[hsl(var(--color-surface-hover))] text-[hsl(var(--color-text-main))] font-bold shadow-sm' : 'text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text-main))]'}`}
                            title="Tree View"
                        >
                            <Network size={12} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {validationStatus === 'invalid' && (
                        <button
                            onClick={handleAutoFix}
                            className="h-7 px-3 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/20 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 transition-all mr-2 animate-in fade-in"
                            title="Auto Fix Common Errors"
                        >
                            <Wrench size={12} /> Auto Fix
                        </button>
                    )}

                    {/* Tools Group */}
                    <div className="flex items-center bg-[hsl(var(--color-surface))] rounded border border-[hsl(var(--color-border))] mr-2 p-0.5">
                        <button onClick={handleFormat} className="p-1.5 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text-main))] hover:bg-[hsl(var(--color-surface-hover))] rounded transition-colors" title="Format JSON">
                            <AlignLeft size={14} />
                        </button>
                        <button onClick={handleMinify} className="p-1.5 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text-main))] hover:bg-[hsl(var(--color-surface-hover))] rounded transition-colors" title="Minify JSON">
                            <Minimize size={14} />
                        </button>
                        <div className="w-px h-3 bg-[hsl(var(--color-border))] mx-0.5"></div>
                        <button onClick={onTransform} className="p-1.5 text-indigo-400 hover:text-indigo-500 hover:bg-[hsl(var(--color-surface-hover))] rounded transition-colors" title="Transform (Query)">
                            <Wand2 size={14} />
                        </button>
                    </div>

                    {/* Meta Actions */}
                    <div className="flex items-center gap-1">
                        <label className="p-1.5 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text-main))] hover:bg-[hsl(var(--color-surface-hover))] rounded cursor-pointer transition-colors" title="Load File">
                            <input type="file" className="hidden" accept=".json,.txt" onChange={handleFileUpload} />
                            <Upload size={14} />
                        </label>
                        <button onClick={handleCopy} className="p-1.5 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text-main))] hover:bg-[hsl(var(--color-surface-hover))] rounded transition-colors" title="Copy to Clipboard">
                            <Copy size={14} />
                        </button>
                        <button onClick={handleClear} className="p-1.5 text-[hsl(var(--color-text-muted))] hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors" title="Clear Editor">
                            <Eraser size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Editor Area */}
            <div
                className="bg-[hsl(var(--color-background))]"
                style={{ flex: '1 1 0%', position: 'relative', overflow: 'hidden', minHeight: 0 }}
            >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    {viewMode === 'code' ? (
                        <Editor
                            height="100%"
                            defaultLanguage="json"
                            theme="vs-dark"
                            value={value}
                            onChange={handleChange}
                            onMount={handleEditorDidMount}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                wordWrap: 'on',
                                formatOnPaste: true,
                                readOnly: readOnly,
                                automaticLayout: true,
                                padding: { top: 10, bottom: 10 },
                                scrollBeyondLastLine: false,
                                renderLineHighlight: 'all',
                                smoothScrolling: true,
                                lineNumbers: 'on',
                                glyphMargin: false,
                                folding: true,
                            }}
                        />
                    ) : (
                        <div className="h-full w-full overflow-auto p-4 custom-scrollbar">
                            {parsedData ? (
                                <JsonTreeViewer data={parsedData} />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-[hsl(var(--color-text-muted))] gap-2 opacity-50">
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
