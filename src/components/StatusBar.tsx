'use client';

import { AlertTriangle } from 'lucide-react';

interface StatusBarProps {
    leftStatus: 'idle' | 'valid' | 'invalid';
    leftError: string;
    rightStatus: 'idle' | 'valid' | 'invalid';
    rightError: string;
    leftStats?: { size: string; length: number };
    rightStats?: { size: string; length: number };
}

export default function StatusBar({ leftStatus, leftError, rightStatus, rightError, leftStats, rightStats }: StatusBarProps) {
    const getStatusDot = (status: string, color: string) => {
        if (status === 'valid') return `bg-${color}-500 shadow-lg`;
        if (status === 'invalid') return 'bg-rose-500 shadow-lg';
        return 'bg-slate-500';
    };

    return (
        <div className="h-8 bg-slate-900 border-t border-slate-800 flex items-center px-4 text-[10px] font-mono select-none shrink-0 z-50 justify-between">
            {/* Left Status */}
            <div className="flex items-center gap-4 overflow-hidden max-w-[45%]">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${leftStatus === 'valid' ? 'bg-emerald-500' : leftStatus === 'invalid' ? 'bg-rose-500' : 'bg-slate-500'}`}></div>
                    <span className="font-bold text-slate-300">EDITOR</span>
                </div>

                {leftStatus === 'invalid' ? (
                    <span className="text-rose-400 truncate flex items-center gap-1">
                        <AlertTriangle size={10} /> {leftError}
                    </span>
                ) : (
                    leftStats && (
                        <div className="flex gap-3 text-slate-500">
                            <span>{leftStats.size}</span>
                            <span>{leftStats.length.toLocaleString()} chars</span>
                        </div>
                    )
                )}
            </div>

            {/* Right Status */}
            {(rightStats || rightStatus !== 'idle') && (
                <div className="flex items-center justify-end gap-4 overflow-hidden max-w-[45%]">
                    {rightStatus === 'invalid' ? (
                        <span className="text-rose-400 truncate flex items-center gap-1">
                            {rightError} <AlertTriangle size={10} />
                        </span>
                    ) : (
                        rightStats && (
                            <div className="flex gap-3 text-slate-500">
                                <span>{rightStats.size}</span>
                                <span>{rightStats.length.toLocaleString()} chars</span>
                            </div>
                        )
                    )}

                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-300">RESULT</span>
                        <div className={`w-2 h-2 rounded-full ${rightStatus === 'valid' ? 'bg-indigo-500' : rightStatus === 'invalid' ? 'bg-rose-500' : 'bg-slate-500'}`}></div>
                    </div>
                </div>
            )}
        </div>
    );
}
