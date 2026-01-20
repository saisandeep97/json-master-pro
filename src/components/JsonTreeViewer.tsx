'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface JsonTreeViewerProps {
    data: any;
    name?: string; // Key name if parent is object
    isLast?: boolean; // For trailing comma logic
    level?: number;
}

export default function JsonTreeViewer({ data, name, isLast = true, level = 0 }: JsonTreeViewerProps) {
    const [expanded, setExpanded] = useState(true);

    const toggleExpand = () => setExpanded(!expanded);

    const handleCopy = (e: React.MouseEvent, text: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        toast.success('Copied value');
    };

    const indent = level * 16; // 16px per level

    // Render Primitives
    if (data === null) {
        return <Node indent={indent} name={name} value="null" type="null" isLast={isLast} onCopy={handleCopy} />;
    }

    if (typeof data === 'boolean') {
        return <Node indent={indent} name={name} value={data.toString()} type="boolean" isLast={isLast} onCopy={handleCopy} />;
    }

    if (typeof data === 'number') {
        return <Node indent={indent} name={name} value={data.toString()} type="number" isLast={isLast} onCopy={handleCopy} />;
    }

    if (typeof data === 'string') {
        return <Node indent={indent} name={name} value={`"${data}"`} type="string" isLast={isLast} rawValue={data} onCopy={handleCopy} />;
    }

    // Render Objects / Arrays
    const isArray = Array.isArray(data);
    const keys = Object.keys(data);
    const isEmpty = keys.length === 0;

    const brackets = isArray ? ['[', ']'] : ['{', '}'];

    return (
        <div className="font-mono text-[13px] leading-6">
            <div
                className="flex items-center hover:bg-[hsl(var(--color-surface-hover))] cursor-pointer rounded px-1 select-none transition-colors"
                style={{ marginLeft: indent }}
                onClick={toggleExpand}
            >
                {/* Chevron */}
                <div className="w-4 h-4 mr-1 flex items-center justify-center text-[hsl(var(--color-text-muted))]">
                    {!isEmpty && (expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />)}
                </div>

                {/* Key (if exists) */}
                {name && <span className="text-[hsl(var(--color-text-main))] mr-1">{name}:</span>}

                {/* Opening Bracket */}
                <span className="text-[hsl(var(--color-text-muted))]">
                    {brackets[0]}
                </span>

                {/* Collapsed Preview */}
                {!expanded && !isEmpty && (
                    <span className="text-[hsl(var(--color-text-secondary))] mx-1 text-xs italic">
                        {isArray ? `Array(${keys.length})` : `Object{${keys.length}}`} ...
                    </span>
                )}

                {/* Empty or Closing Bracket (inline if collapsed/empty) */}
                {(!expanded || isEmpty) && (
                    <span className="text-[hsl(var(--color-text-muted))]">
                        {brackets[1]}{!isLast && ','}
                    </span>
                )}
            </div>

            {/* Children */}
            {expanded && !isEmpty && (
                <div>
                    {keys.map((key, i) => (
                        <JsonTreeViewer
                            key={key}
                            data={data[key]}
                            name={isArray ? undefined : `"${key}"`}
                            isLast={i === keys.length - 1}
                            level={level + 1}
                        />
                    ))}
                    <div style={{ marginLeft: indent + 20 }} className="text-[hsl(var(--color-text-muted))]">
                        {brackets[1]}{!isLast && ','}
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper Node for Primitives
function Node({ indent, name, value, type, isLast, rawValue, onCopy }: any) {
    const colorClass =
        type === 'string' ? "text-emerald-400" :
            type === 'number' ? "text-blue-400" :
                type === 'boolean' ? "text-amber-400" :
                    "text-rose-400"; // null

    return (
        <div
            className="flex items-center hover:bg-[hsl(var(--color-surface-hover))] px-1 group rounded"
            style={{ marginLeft: indent + 20 }} // +20 to align with children of objects
        >
            {name && <span className="text-[hsl(var(--color-text-main))] mr-1">{name}:</span>}
            <span className={`${colorClass} break-all`} onClick={(e) => onCopy(e, rawValue ?? value)}>
                {value}
            </span>
            <span className="text-[hsl(var(--color-text-muted))]">{!isLast && ','}</span>

            {/* Copy Button (on hover) */}
            <button
                onClick={(e) => onCopy(e, rawValue ?? value)}
                className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text-main))] transition-opacity"
                title="Copy Value"
            >
                <Copy size={10} />
            </button>
        </div>
    );
}
