import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, X, ArrowRight, Check, Sparkles, Filter, Braces, Code2 } from 'lucide-react';
import toast from 'react-hot-toast';
import jmespath from 'jmespath';

interface TransformModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    onApply: (result: any) => void;
}

type QueryMode = 'javascript' | 'jmespath';

export default function TransformModal({ isOpen, onClose, data, onApply }: TransformModalProps) {
    const [mode, setMode] = useState<QueryMode>('javascript');
    const [query, setQuery] = useState('data');
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset default query based on mode when opening or changing mode
            if (mode === 'javascript' && query === '') setQuery('data');
            if (mode === 'jmespath' && query === '') setQuery('[*]');
            runQuery(query, mode);
        }
    }, [isOpen, data]);

    const runQuery = (q: string, currentMode: QueryMode) => {
        setQuery(q);
        if (!q.trim()) {
            setResult('');
            setError('');
            return;
        }

        try {
            let res;
            if (currentMode === 'javascript') {
                // Safe usage for client-side app tool
                const func = new Function('data', `
                    try {
                        return ${q};
                    } catch(e) {
                         return (function() { ${q} })();
                    }
                `);
                res = func(data);
            } else {
                // JMESPath Mode
                res = jmespath.search(data, q);
            }

            if (res === undefined) {
                setResult('undefined');
            } else {
                setResult(JSON.stringify(res, null, 2));
            }
            setError('');
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleModeChange = (newMode: QueryMode) => {
        setMode(newMode);
        const defaultQuery = newMode === 'jmespath' ? '[*]' : 'data';
        setQuery(defaultQuery);
        runQuery(defaultQuery, newMode);
    };

    const insertExample = (ex: string) => {
        runQuery(ex, mode);
    };

    const handleApply = () => {
        if (error) {
            toast.error('Cannot apply invalid transformation');
            return;
        }
        onApply(result);
        onClose();
        toast.success('Transformation applied');
    };

    if (!isOpen) return null;

    const examples = mode === 'javascript'
        ? ['data.filter(x => x.id > 1)', 'data.map(x => x.name)', 'data.sort((a,b) => a.id - b.id)']
        : ['[*].name', '[?id > `1`]', 'sort_by(@, &id)', '{Names: [*].name}'];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-5xl bg-[hsl(var(--color-surface))] rounded-2xl shadow-2xl border border-[hsl(var(--color-border))] flex flex-col max-h-[85vh] overflow-hidden transform transition-all scale-100">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--color-border))]">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-lg font-bold flex items-center gap-2"><Sparkles size={18} className="text-amber-400" /> Transform JSON</h2>
                            <p className="text-xs text-[hsl(var(--color-text-muted))]">Process your data using JavaScript or JMESPath query language.</p>
                        </div>

                        {/* Mode Switcher */}
                        <div className="flex bg-[hsl(var(--color-background))] rounded-lg p-1 border border-[hsl(var(--color-border))] ml-4">
                            <button
                                onClick={() => handleModeChange('javascript')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'javascript' ? 'bg-indigo-500 text-white shadow' : 'text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-surface-hover))]'}`}
                            >
                                <Code2 size={14} /> JavaScript
                            </button>
                            <button
                                onClick={() => handleModeChange('jmespath')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'jmespath' ? 'bg-amber-500 text-white shadow' : 'text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-surface-hover))]'}`}
                            >
                                <Filter size={14} /> JMESPath
                            </button>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[hsl(var(--color-surface-hover))] rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col lg:flex-row min-h-0">
                    {/* Query Section */}
                    <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-[hsl(var(--color-border))]">
                        <div className="px-4 py-2 bg-[hsl(var(--color-background))] text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider border-b border-[hsl(var(--color-border))] flex justify-between items-center">
                            <span>Query Expression</span>
                            <a
                                href={mode === 'javascript' ? "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array" : "https://jmespath.org/tutorial.html"}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-mono text-indigo-400 hover:underline flex items-center gap-1"
                            >
                                {mode === 'javascript' ? 'JS Array Docs' : 'JMESPath Tutorial'} <ArrowRight size={10} />
                            </a>
                        </div>
                        <div className="flex-1 relative min-h-[200px]">
                            <Editor
                                height="100%"
                                defaultLanguage={mode === 'javascript' ? 'javascript' : 'mariadb'} // mariadb used for similar SQL-like highlighting for JMES
                                theme="vs-dark"
                                value={query}
                                onChange={(val) => runQuery(val || '', mode)}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: 'off',
                                    padding: { top: 16, bottom: 16 },
                                    overviewRulerLanes: 0,
                                    hideCursorInOverviewRuler: true,
                                    scrollbar: { vertical: 'hidden' },
                                    wordWrap: 'on',
                                    renderLineHighlight: 'none'
                                }}
                            />
                        </div>

                        {/* Wizard / Examples */}
                        <div className="p-4 bg-[hsl(var(--color-background))]/50 border-t border-[hsl(var(--color-border))] text-xs">
                            <span className="font-bold text-[hsl(var(--color-text-muted))] block mb-2 flex items-center gap-1"><Sparkles size={12} /> {mode === 'javascript' ? 'Common Operations' : 'Wizard Shortcuts'}</span>
                            <div className="flex flex-wrap gap-2">
                                {examples.map(ex => (
                                    <button
                                        key={ex}
                                        onClick={() => insertExample(ex)}
                                        className="px-3 py-1.5 bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] rounded-md cursor-pointer hover:border-indigo-500 hover:text-indigo-400 transition-colors code-font text-[11px]"
                                    >
                                        {ex}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="flex-1 flex flex-col bg-[hsl(var(--color-background))]">
                        <div className="px-4 py-2 bg-[hsl(var(--color-background))] text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider border-b border-[hsl(var(--color-border))] flex justify-between items-center">
                            <span>Live Preview</span>
                            {error ? (
                                <span className="text-rose-400 flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded"><X size={12} /> Invalid Query</span>
                            ) : (
                                <span className="text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded"><Check size={12} /> Valid Result</span>
                            )}
                        </div>
                        <div className="flex-1 relative min-h-[200px]">
                            {error ? (
                                <div className="absolute inset-0 p-4 text-rose-400 font-mono text-xs whitespace-pre-wrap">{error}</div>
                            ) : (
                                <Editor
                                    height="100%"
                                    defaultLanguage="json"
                                    theme="vs-dark"
                                    value={result}
                                    options={{
                                        readOnly: true,
                                        minimap: { enabled: false },
                                        fontSize: 12,
                                        lineNumbers: 'off',
                                        padding: { top: 16, bottom: 16 },
                                        renderLineHighlight: 'none'
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] flex justify-between items-center gap-3">
                    <span className="text-[10px] text-[hsl(var(--color-text-muted))]">
                        {mode === 'javascript' ? 'Tip: Use data variable to access your JSON.' : 'Tip: Use @ to refer to the current node.'}
                    </span>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text-main))] transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={!!error}
                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Apply Transformation <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
