'use client';

import { useState, useEffect } from 'react';
import { validateJson, formatJson, minifyJson, fixJson } from '@/lib/json-utils';
import AdBanner from './AdBanner'; // Import AdBanner

export default function JsonEditor() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Auto-validate on input change
    useEffect(() => {
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

    const handleFormat = () => {
        try {
            const formatted = formatJson(input);
            setInput(formatted);
            // setOutput(formatted); // Optional: if we want output pane to show result
        } catch (e) {
            // already handled by status
        }
    };

    const handleMinify = () => {
        try {
            const minified = minifyJson(input);
            setInput(minified);
        } catch (e) {
            // handled
        }
    };

    const handleFix = () => {
        const fixed = fixJson(input);
        setInput(fixed);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(input);
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Toolbar */}
            <div className="card panel-header">
                <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-primary">JSON Master Pro</span>
                    <div className={`text-sm px-2 py-1 rounded ${status === 'valid' ? 'bg-green-900/30 text-green-400' :
                            status === 'invalid' ? 'bg-red-900/30 text-red-400' : 'text-muted'
                        }`}>
                        {status === 'idle' ? 'Ready' : status === 'valid' ? 'Valid JSON' : 'Invalid JSON'}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleFix} className="btn btn-primary">Fix JSON</button>
                    <button onClick={handleFormat} className="btn btn-ghost" disabled={status === 'invalid'}>Beautify</button>
                    <button onClick={handleMinify} className="btn btn-ghost" disabled={status === 'invalid'}>Minify</button>
                    <button onClick={handleCopy} className="btn btn-ghost">Copy</button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[500px]">
                {/* Input Pane */}
                <div className="flex flex-col gap-2 h-full">
                    <div className="flex justify-between items-center text-sm text-muted">
                        <span>Input</span>
                        <span>{input.length} chars</span>
                    </div>
                    <textarea
                        className={`flex-1 ${status === 'invalid' ? 'border-red-500/50' : ''}`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste your JSON here..."
                        spellCheck={false}
                    />
                    {errorMessage && (
                        <div className="text-error text-sm p-2 bg-red-900/10 rounded border border-red-900/20">
                            Error: {errorMessage}
                        </div>
                    )}
                </div>

                {/* Output/Preview Pane (Visualizer placeholder or just read-only view)
            For now, let's make it a 'Clean View' or simply a second pane if we want to diff.
            But the requirements asked for a dual-pane editor. Usually one is Code, one is Tree/Preview.
            Since building a full Tree View from scratch is complex, let's make the right pane the "Formatted/Result" view 
            or keep it strictly as an editor for now and maybe add a Tree View later if requested.
            Actually, the user asked to "validate, beautify, fix". 
            Let's make the right pane show the "result" of an operation if we want, OR just make it single pane?
            "Build Dual-Pane Editor Component" was in my plan.
            Let's make the right pane a "Live Preview" which is always formatted if valid.
        */}
                <div className="flex flex-col gap-2 h-full">
                    <div className="flex justify-between items-center text-sm text-muted">
                        <span>Live Preview (Formatted)</span>
                    </div>
                    <textarea
                        className="flex-1 opacity-70"
                        readOnly
                        value={status === 'valid' ? formatJson(input) : ''}
                        placeholder="Valid JSON will appear here..."
                    />
                </div>
            </div>

            {/* Ad Placeholder below editor */}
            <AdBanner />
        </div>
    );
}
