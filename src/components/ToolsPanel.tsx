'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { formatJson, toCsv, toXml, toYaml, toTypescript } from '@/lib/json-utils';
import { Clipboard, Code, FileJson, FileType, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ToolsPanelProps {
    jsonInput: string;
    isValid: boolean;
}

type Tab = 'preview' | 'convert' | 'generate';

export default function ToolsPanel({ jsonInput, isValid }: ToolsPanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>('preview');
    const [conversionOutput, setConversionOutput] = useState('');
    const [conversionType, setConversionType] = useState('YAML'); // Default to something

    useEffect(() => {
        if (isValid && jsonInput) {
            handleAutoConvert();
        }
    }, [jsonInput, activeTab, isValid, conversionType]);

    const handleAutoConvert = () => {
        if (!isValid) return;
        try {
            switch (conversionType) {
                case 'YAML': setConversionOutput(toYaml(jsonInput)); break;
                case 'XML': setConversionOutput(toXml(jsonInput)); break;
                case 'CSV': setConversionOutput(toCsv(jsonInput)); break;
                case 'TypeScript': setConversionOutput(toTypescript(jsonInput)); break;
                default: setConversionOutput('');
            }
        } catch (e: any) {
            setConversionOutput(`Error: ${e.message}`);
        }
    };

    const copyOutput = () => {
        navigator.clipboard.writeText(conversionOutput || (isValid ? formatJson(jsonInput) : ''));
        toast.success('Copied output');
    };

    return (
        <div className="flex flex-col h-full card border-0 p-0 overflow-hidden bg-[hsl(var(--color-surface))]/50 backdrop-blur-sm shadow-xl">
            {/* Tabs Header */}
            <div className="flex items-center text-xs font-medium border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))]">
                <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all relative ${activeTab === 'preview'
                            ? 'text-indigo-400 bg-[hsl(var(--color-background))]/50'
                            : 'text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text-main))] hover:bg-[hsl(var(--color-surface-hover))]'
                        }`}
                >
                    <FileJson size={16} /> <span className="uppercase tracking-wide">Preview</span>
                    {activeTab === 'preview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_-2px_8px_rgba(99,102,241,0.5)]"></div>}
                </button>

                <div className="w-px h-6 bg-[hsl(var(--color-border))]"></div>

                <button
                    onClick={() => { setActiveTab('convert'); setConversionType('YAML'); }}
                    className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all relative ${activeTab === 'convert'
                            ? 'text-pink-400 bg-[hsl(var(--color-background))]/50'
                            : 'text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text-main))] hover:bg-[hsl(var(--color-surface-hover))]'
                        }`}
                >
                    <FileType size={16} /> <span className="uppercase tracking-wide">Convert</span>
                    {activeTab === 'convert' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 shadow-[0_-2px_8px_rgba(236,72,153,0.5)]"></div>}
                </button>

                <div className="w-px h-6 bg-[hsl(var(--color-border))]"></div>

                <button
                    onClick={() => { setActiveTab('generate'); setConversionType('TypeScript'); }}
                    className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all relative ${activeTab === 'generate'
                            ? 'text-emerald-400 bg-[hsl(var(--color-background))]/50'
                            : 'text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text-main))] hover:bg-[hsl(var(--color-surface-hover))]'
                        }`}
                >
                    <Code size={16} /> <span className="uppercase tracking-wide">Generate</span>
                    {activeTab === 'generate' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_-2px_8px_rgba(16,185,129,0.5)]"></div>}
                </button>
            </div>

            {/* Sub-toolbar for Convert/Generate */}
            {(activeTab === 'convert' || activeTab === 'generate') && (
                <div className="flex gap-2 p-2 border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] items-center animate-in slide-in-from-top-2 duration-200">
                    <div className="flex bg-[hsl(var(--color-surface))] rounded-lg p-1 border border-[hsl(var(--color-border))]">
                        {activeTab === 'convert' && ['YAML', 'XML', 'CSV'].map(type => (
                            <button
                                key={type}
                                onClick={() => setConversionType(type)}
                                className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${conversionType === type
                                        ? 'bg-pink-500 text-white shadow-md'
                                        : 'text-[hsl(var(--color-text-muted))] hover:text-white hover:bg-[hsl(var(--color-surface-hover))]'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                        {activeTab === 'generate' && ['TypeScript'].map(type => (
                            <button
                                key={type}
                                onClick={() => setConversionType(type)}
                                className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${conversionType === type
                                        ? 'bg-emerald-500 text-white shadow-md'
                                        : 'text-[hsl(var(--color-text-muted))] hover:text-white hover:bg-[hsl(var(--color-surface-hover))]'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1" />

                    <button onClick={copyOutput} className="btn gap-1.5 text-xs py-1 px-3 hover:bg-[hsl(var(--color-surface-hover))]">
                        <Clipboard size={14} /> <span className="font-medium">Copy Result</span>
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 relative bg-[hsl(var(--color-background))]">
                {activeTab === 'preview' && (
                    <Editor
                        height="100%"
                        defaultLanguage="json"
                        theme="vs-dark"
                        value={isValid ? formatJson(jsonInput) : ''}
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            lineNumbers: 'off',
                            scrollBeyondLastLine: false,
                            padding: { top: 20, bottom: 20 },
                            renderLineHighlight: 'none'
                        }}
                    />
                )}

                {(activeTab === 'convert' || activeTab === 'generate') && (
                    <Editor
                        height="100%"
                        defaultLanguage={conversionType === 'TypeScript' ? 'typescript' : conversionType === 'XML' ? 'xml' : conversionType === 'YAML' ? 'yaml' : 'plaintext'}
                        theme="vs-dark"
                        value={conversionOutput}
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            padding: { top: 20, bottom: 20 },
                            scrollBeyondLastLine: false
                        }}
                    />
                )}

                {!isValid && activeTab !== 'preview' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[hsl(var(--color-background))]/80 backdrop-blur-sm p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
                            <FileType size={24} className="text-rose-400" />
                        </div>
                        <h3 className="text-[hsl(var(--color-text-main))] font-medium mb-1">Waiting for valid JSON</h3>
                        <p className="text-[hsl(var(--color-text-muted))] text-sm">Correct the errors in the input editor to generate {conversionType}.</p>
                    </div>
                )}
                {!isValid && activeTab === 'preview' && !jsonInput && (
                    <div className="absolute inset-0 flex items-center justify-center text-[hsl(var(--color-text-muted))] text-sm opacity-50">
                        JSON Preview
                    </div>
                )}
            </div>
        </div>
    );
}
