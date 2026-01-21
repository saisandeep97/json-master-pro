'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, ArrowRight, Filter, ArrowUpDown, Layers, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGlobal } from '@/context/GlobalContext';

interface TransformModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    onApply: (result: any) => void;
}

type Operation = 'filter' | 'sort' | 'pick';
type Operator = 'equals' | 'contains' | 'gt' | 'lt' | 'exists';

export default function TransformModal({ isOpen, onClose, data, onApply }: TransformModalProps) {
    const { theme } = useGlobal();

    // Operation state
    const [operation, setOperation] = useState<Operation>('filter');

    // Filter state
    const [filterField, setFilterField] = useState('');
    const [filterOperator, setFilterOperator] = useState<Operator>('contains');
    const [filterValue, setFilterValue] = useState('');

    // Sort state
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Pick fields state
    const [pickedFields, setPickedFields] = useState<string[]>([]);

    // Result
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    // Extract available fields from data
    const availableFields = useMemo(() => {
        if (!data) return [];
        const items = Array.isArray(data) ? data : [data];
        if (items.length === 0) return [];
        const allKeys = new Set<string>();
        items.forEach(item => {
            if (item && typeof item === 'object') {
                Object.keys(item).forEach(key => allKeys.add(key));
            }
        });
        return Array.from(allKeys);
    }, [data]);

    // Auto-select first field when fields become available
    useEffect(() => {
        if (availableFields.length > 0 && !filterField) {
            setFilterField(availableFields[0]);
            setSortField(availableFields[0]);
        }
    }, [availableFields]);

    // Run transformation whenever inputs change
    useEffect(() => {
        if (!isOpen || !data) return;
        runTransform();
    }, [isOpen, data, operation, filterField, filterOperator, filterValue, sortField, sortDirection, pickedFields]);

    const runTransform = () => {
        if (!data) {
            setResult(null);
            setError('');
            return;
        }

        try {
            const items = Array.isArray(data) ? [...data] : [data];
            let transformed = items;

            if (operation === 'filter' && filterField) {
                transformed = items.filter(item => {
                    if (!item || typeof item !== 'object') return false;
                    const val = item[filterField];
                    if (val === undefined || val === null) return filterOperator === 'exists' ? false : false;

                    const strVal = String(val).toLowerCase();
                    const searchVal = filterValue.toLowerCase();

                    switch (filterOperator) {
                        case 'equals':
                            return strVal === searchVal;
                        case 'contains':
                            return strVal.includes(searchVal);
                        case 'gt':
                            return Number(val) > Number(filterValue);
                        case 'lt':
                            return Number(val) < Number(filterValue);
                        case 'exists':
                            return true;
                        default:
                            return true;
                    }
                });
            }

            if (operation === 'sort' && sortField) {
                transformed = [...items].sort((a, b) => {
                    const aVal = a?.[sortField];
                    const bVal = b?.[sortField];

                    // Handle numbers
                    if (typeof aVal === 'number' && typeof bVal === 'number') {
                        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                    }

                    // Handle strings
                    const strA = String(aVal ?? '');
                    const strB = String(bVal ?? '');
                    return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
                });
            }

            if (operation === 'pick' && pickedFields.length > 0) {
                transformed = items.map(item => {
                    if (!item || typeof item !== 'object') return item;
                    const picked: Record<string, any> = {};
                    pickedFields.forEach(field => {
                        if (field in item) picked[field] = item[field];
                    });
                    return picked;
                });
            }

            // Return single object if original was not an array
            const finalResult = !Array.isArray(data) && transformed.length === 1
                ? transformed[0]
                : transformed;

            setResult(finalResult);
            setError('');
        } catch (e: any) {
            setError(e.message || 'Transform error');
            setResult(null);
        }
    };

    const handleApply = () => {
        if (error || result === null) {
            toast.error('Cannot apply - no valid result');
            return;
        }
        onApply(JSON.stringify(result, null, 2));
        onClose();
        toast.success('Transformation applied to Document 2');
    };

    const togglePickedField = (field: string) => {
        setPickedFields(prev =>
            prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
        );
    };

    if (!isOpen) return null;

    const resultPreview = result !== null
        ? JSON.stringify(result, null, 2)
        : error || 'No result';

    const resultCount = Array.isArray(result) ? result.length : (result ? 1 : 0);
    const originalCount = Array.isArray(data) ? data.length : (data ? 1 : 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 flex flex-col max-h-[85vh] overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Transform JSON</h2>
                            <p className="text-xs text-slate-400">Filter, sort, or pick fields from your data</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 flex min-h-0 overflow-hidden">
                    {/* Left Panel - Controls */}
                    <div className="w-80 flex-shrink-0 border-r border-slate-700 p-5 overflow-y-auto bg-slate-800/30">

                        {/* Operation Selector */}
                        <div className="mb-6">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">Operation</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'filter', label: 'Filter', icon: Filter, color: 'from-blue-500 to-cyan-500' },
                                    { id: 'sort', label: 'Sort', icon: ArrowUpDown, color: 'from-purple-500 to-pink-500' },
                                    { id: 'pick', label: 'Pick', icon: Layers, color: 'from-green-500 to-emerald-500' },
                                ].map(op => (
                                    <button
                                        key={op.id}
                                        onClick={() => setOperation(op.id as Operation)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${operation === op.id
                                                ? `bg-gradient-to-br ${op.color} border-transparent text-white shadow-lg`
                                                : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                                            }`}
                                    >
                                        <op.icon size={22} />
                                        <span className="text-xs font-medium">{op.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filter Options */}
                        {operation === 'filter' && (
                            <div className="space-y-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
                                <div>
                                    <label className="text-xs text-slate-400 mb-2 block">Field to filter</label>
                                    <select
                                        value={filterField}
                                        onChange={(e) => setFilterField(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none"
                                    >
                                        {availableFields.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-2 block">Condition</label>
                                    <select
                                        value={filterOperator}
                                        onChange={(e) => setFilterOperator(e.target.value as Operator)}
                                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="contains">Contains</option>
                                        <option value="equals">Equals</option>
                                        <option value="gt">Greater than</option>
                                        <option value="lt">Less than</option>
                                        <option value="exists">Exists (not null)</option>
                                    </select>
                                </div>
                                {filterOperator !== 'exists' && (
                                    <div>
                                        <label className="text-xs text-slate-400 mb-2 block">Value</label>
                                        <input
                                            type="text"
                                            value={filterValue}
                                            onChange={(e) => setFilterValue(e.target.value)}
                                            placeholder="Enter search value..."
                                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Sort Options */}
                        {operation === 'sort' && (
                            <div className="space-y-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
                                <div>
                                    <label className="text-xs text-slate-400 mb-2 block">Sort by field</label>
                                    <select
                                        value={sortField}
                                        onChange={(e) => setSortField(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none"
                                    >
                                        {availableFields.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSortDirection('asc')}
                                        className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${sortDirection === 'asc'
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                : 'bg-slate-900 border border-slate-600 text-slate-300'
                                            }`}
                                    >
                                        ↑ Ascending
                                    </button>
                                    <button
                                        onClick={() => setSortDirection('desc')}
                                        className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${sortDirection === 'desc'
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                : 'bg-slate-900 border border-slate-600 text-slate-300'
                                            }`}
                                    >
                                        ↓ Descending
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Pick Fields Options */}
                        {operation === 'pick' && (
                            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                                <label className="text-xs text-slate-400 mb-3 block">Select fields to keep</label>
                                <div className="flex flex-wrap gap-2">
                                    {availableFields.map(field => (
                                        <button
                                            key={field}
                                            onClick={() => togglePickedField(field)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${pickedFields.includes(field)
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                                    : 'bg-slate-900 border border-slate-600 text-slate-300 hover:border-green-500/50'
                                                }`}
                                        >
                                            {field}
                                        </button>
                                    ))}
                                </div>
                                {pickedFields.length === 0 && (
                                    <p className="text-xs text-slate-500 mt-3">Click fields above to select them</p>
                                )}
                            </div>
                        )}

                        {/* Stats */}
                        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Input items:</span>
                                <span className="text-white font-medium">{originalCount}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-2">
                                <span className="text-slate-400">Output items:</span>
                                <span className={`font-medium ${resultCount < originalCount ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {resultCount}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Preview */}
                    <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
                        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between bg-slate-800/30">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Preview</span>
                            {error ? (
                                <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">Error</span>
                            ) : (
                                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Ready</span>
                            )}
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            <pre className={`text-sm font-mono whitespace-pre-wrap ${error ? 'text-red-400' : 'text-slate-300'}`}>
                                {resultPreview}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 bg-slate-800/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        disabled={!!error || result === null}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Apply to Document 2 <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
