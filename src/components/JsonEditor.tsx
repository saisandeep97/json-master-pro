'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowRightLeft, ArrowRight, ArrowLeft } from 'lucide-react';
import { useGlobal } from '@/context/GlobalContext';

import EditorPane from './EditorPane';
import StatusBar from './StatusBar';
import TransformModal from './TransformModal';

// Helper for safe transformation input
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
    const { layoutMode } = useGlobal();
    const [leftInput, setLeftInput] = useState('');
    const [rightInput, setRightInput] = useState('');

    // Validation
    const leftVal = useValidation(leftInput);
    const rightVal = useValidation(rightInput);

    // Transform State
    const [transformOpen, setTransformOpen] = useState(false);
    const [activePane, setActivePane] = useState<'left' | 'right'>('left');

    // Resize State
    const [splitRatio, setSplitRatio] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Resize Logic
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const newRatio = ((e.clientX - containerRect.left) / containerRect.width) * 100;

            // Limit ratio between 20% and 80%
            if (newRatio >= 20 && newRatio <= 80) {
                setSplitRatio(newRatio);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const getStats = (text: string) => {
        if (!text) return { size: '0 B', length: 0 };
        const bytes = new TextEncoder().encode(text).length;
        const size = bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(2)} KB`;
        return { size, length: text.length };
    };

    const leftStats = useMemo(() => getStats(leftInput), [leftInput]);
    const rightStats = useMemo(() => getStats(rightInput), [rightInput]);

    useEffect(() => {
        const savedLeft = localStorage.getItem('json-master-left');
        const savedRight = localStorage.getItem('json-master-right');

        const defaultLeft = JSON.stringify({
            "project": "JSON Master Pro",
            "version": "2.0.0",
            "features": [
                "Dual Pane Editor",
                "Tree View Visualization",
                "Smart JSON Fixer",
                "Dark/Light Theme"
            ],
            "settings": {
                "theme": "dark",
                "notifications": true
            }
        }, null, 2);

        const defaultRight = JSON.stringify({
            "project": "JSON Master Pro",
            "version": "1.0.0",
            "notes": "Older version for diff comparison...",
            "features": [
                "Basic Editor"
            ]
        }, null, 2);

        // Validate loaded data
        if (savedLeft && safeParse(savedLeft)) {
            setLeftInput(savedLeft);
        } else {
            setLeftInput(defaultLeft);
        }

        if (savedRight && safeParse(savedRight)) {
            setRightInput(savedRight);
        } else {
            setRightInput(defaultRight);
        }
    }, []);

    // ... (rest of local storage effects)
    useEffect(() => {
        localStorage.setItem('json-master-left', leftInput);
    }, [leftInput]);

    useEffect(() => {
        localStorage.setItem('json-master-right', rightInput);
    }, [rightInput]);

    const handleSwap = () => {
        const temp = leftInput;
        setLeftInput(rightInput);
        setRightInput(temp);
        toast.success('Swapped contents');
    };

    const copyToRight = () => {
        setRightInput(leftInput);
        toast.success('Copied Left to Right');
    };

    const copyToLeft = () => {
        setLeftInput(rightInput);
        toast.success('Copied Right to Left');
    };

    const openTransform = (pane: 'left' | 'right') => {
        const input = pane === 'left' ? leftInput : rightInput;
        if (!safeParse(input)) {
            toast.error('Invalid JSON - cannot transform');
            return;
        }
        setActivePane(pane);
        setTransformOpen(true);
    };

    const handleTransformApply = (result: string) => {
        if (activePane === 'left') setLeftInput(result);
        else setRightInput(result);
    };

    // ... (handlers)

    return (
        <div className="flex flex-col h-full w-full overflow-hidden">
            <Toaster position="bottom-right" toastOptions={{
                style: {
                    background: 'hsl(var(--color-surface))',
                    color: 'hsl(var(--color-text-main))',
                    border: '1px solid hsl(var(--color-border))',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px'
                }
            }} />

            <TransformModal
                isOpen={transformOpen}
                onClose={() => setTransformOpen(false)}
                data={safeParse(activePane === 'left' ? leftInput : rightInput)}
                onApply={handleTransformApply}
            />

            {/* Main Editor Area */}
            <div
                className="flex-1 min-h-0 relative"
                ref={containerRef}
                style={{ flex: '1 1 0%', minHeight: 0 }}
            >
                {layoutMode === 'split' ? (
                    <div className="absolute inset-0 flex flex-row pt-2 pb-0">
                        {/* Left Editor */}
                        <div style={{ width: `${splitRatio}%` }} className="min-w-0 pr-1 h-full relative">
                            <EditorPane
                                title="Document 1"
                                value={leftInput}
                                onChange={setLeftInput}
                                headerColor="emerald"
                                onTransform={() => openTransform('left')}
                                validationStatus={leftVal.status}
                            />
                        </div>

                        {/* Draggable Handle & Controls */}
                        <div
                            className="w-2 flex flex-col items-center justify-center relative z-10 cursor-col-resize group hover:bg-[hsl(var(--color-surface-hover))]"
                            onMouseDown={handleMouseDown}
                        >
                            <div className={`absolute inset-y-0 left-1/2 w-0.5 bg-[hsl(var(--color-border))] transition-colors ${isDragging ? 'bg-indigo-500' : 'group-hover:bg-indigo-500'}`}></div>

                            {/* Central Controls (Floating over handle) */}
                            <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-2 text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-background))] py-2 border border-[hsl(var(--color-border))] rounded-full shadow-xl pointer-events-auto cursor-default z-20">
                                <button onClick={copyToRight} className="p-1.5 rounded-full hover:bg-[hsl(var(--color-surface-hover))] hover:text-[hsl(var(--color-text-main))] transition-colors" title="Copy to Right">
                                    <ArrowRight size={14} />
                                </button>
                                <button onClick={handleSwap} className="p-1.5 rounded-full hover:bg-[hsl(var(--color-surface-hover))] hover:text-[hsl(var(--color-text-main))] transition-colors" title="Swap">
                                    <ArrowRightLeft size={14} />
                                </button>
                                <button onClick={copyToLeft} className="p-1.5 rounded-full hover:bg-[hsl(var(--color-surface-hover))] hover:text-[hsl(var(--color-text-main))] transition-colors" title="Copy to Left">
                                    <ArrowLeft size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Right Editor */}
                        <div style={{ width: `${100 - splitRatio}%` }} className="min-w-0 pl-1 h-full relative">
                            <EditorPane
                                title="Document 2"
                                value={rightInput}
                                onChange={setRightInput}
                                headerColor="indigo"
                                onTransform={() => openTransform('right')}
                                validationStatus={rightVal.status}
                            />
                        </div>

                        {/* Drag Overlay */}
                        {isDragging && <div className="fixed inset-0 z-50 cursor-col-resize"></div>}
                    </div>
                ) : (
                    <div className="absolute inset-0 card p-0 overflow-hidden bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] mt-2">
                        <DiffEditor
                            height="100%"
                            original={leftInput}
                            modified={rightInput}
                            language="json"
                            theme="vs-dark"
                            options={{
                                renderSideBySide: true,
                                readOnly: true,
                                minimap: { enabled: false },
                                fontSize: 13,
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                padding: { top: 20, bottom: 20 },
                                scrollBeyondLastLine: false,
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <StatusBar
                leftStatus={leftVal.status}
                leftError={leftVal.error}
                rightStatus={rightVal.status}
                rightError={rightVal.error}
                leftStats={leftStats}
                rightStats={rightStats}
            />
        </div>
    );
}
