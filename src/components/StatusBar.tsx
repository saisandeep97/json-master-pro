'use client';

import { CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

interface StatusBarProps {
    leftStatus: 'idle' | 'valid' | 'invalid';
    leftError: string;
    rightStatus: 'idle' | 'valid' | 'invalid';
    rightError: string;
    leftStats?: { size: string; length: number };
    rightStats?: { size: string; length: number };
}

export default function StatusBar({ leftStatus, leftError, rightStatus, rightError, leftStats, rightStats }: StatusBarProps) {
    return (
        <div className="h-8 bg-[hsl(var(--color-surface))] border-t border-[hsl(var(--color-border))] flex items-center px-4 text-[10px] font-mono select-none shrink-0 z-50 justify-between">
            {/* Left Status */}
            <div className="flex items-center gap-4 overflow-hidden max-w-[45%]">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${leftStatus === 'valid' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : leftStatus === 'invalid' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-gray-500'}`}></div>
                    <span className="font-bold text-[hsl(var(--color-text-main))]">DOC 1</span>
                </div>

                {leftStatus === 'invalid' ? (
                    <span className="text-rose-400 truncate flex items-center gap-1">
                        <AlertTriangle size={10} /> {leftError}
                    </span>
                ) : (
                    leftStats && (
                        <div className="flex gap-3 text-[hsl(var(--color-text-muted))]">
                            <span>{leftStats.size}</span>
                            <span>{leftStats.length.toLocaleString()} chars</span>
                        </div>
                    )
                )}
            </div>

            {/* Right Status */}
            <div className="flex items-center justify-end gap-4 overflow-hidden max-w-[45%]">
                {rightStatus === 'invalid' ? (
                    <span className="text-rose-400 truncate flex items-center gap-1">
                        {rightError} <AlertTriangle size={10} />
                    </span>
                ) : (
                    rightStats && (
                        <div className="flex gap-3 text-[hsl(var(--color-text-muted))]">
                            <span>{rightStats.size}</span>
                            <span>{rightStats.length.toLocaleString()} chars</span>
                        </div>
                    )
                )}

                <div className="flex items-center gap-2">
                    <span className="font-bold text-[hsl(var(--color-text-main))]">DOC 2</span>
                    <div className={`w-2 h-2 rounded-full ${rightStatus === 'valid' ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : rightStatus === 'invalid' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-gray-500'}`}></div>
                </div>
            </div>
        </div>
    );
}
