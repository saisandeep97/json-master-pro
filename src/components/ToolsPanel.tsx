'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { formatJson, toCsv, toXml, toYaml, toTypescript } from '@/lib/json-utils';
import { Clipboard, Code, FileJson, FileType, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

interface ToolsPanelProps {
    jsonInput: string;
    isValid: boolean;
}

type Tab = 'preview' | 'convert' | 'generate';

export default function ToolsPanel({ jsonInput, isValid }: ToolsPanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>('preview');
    const [conversionOutput, setConversionOutput] = useState('');
    const [conversionType, setConversionType] = useState('');

    useEffect(() => {
        // Reset conversion when input changes or tab changes if needed
        // But maybe we want to persist it until user clicks convert again?
        // Let's auto-convert if valid and tab is active
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
        <div className="flex flex-col h-full card border-0 p-0 overflow-hidden bg-slate-900/50">
            {/* Tabs Header */}
            <div className="flex items-center text-sm border-b border-slate-700 bg-slate-800/80">
                <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-4 py-3 flex items-center gap-2 transition-colors ${activeTab === 'preview' ? 'text-primary border-b-2 border-primary bg-slate-800' : 'text-muted hover:text-slate-200'}`}
                >
                    <FileJson size={16} /> Preview
                </button>
                <button
                    onClick={() => { setActiveTab('convert'); setConversionType('YAML'); }}
                    className={`px-4 py-3 flex items-center gap-2 transition-colors ${activeTab === 'convert' ? 'text-accent border-b-2 border-accent bg-slate-800' : 'text-muted hover:text-slate-200'}`}
                >
                    <FileType size={16} /> Convert
                </button>
                <button
                    onClick={() => { setActiveTab('generate'); setConversionType('TypeScript'); }}
                    className={`px-4 py-3 flex items-center gap-2 transition-colors ${activeTab === 'generate' ? 'text-green-400 border-b-2 border-green-400 bg-slate-800' : 'text-muted hover:text-slate-200'}`}
                >
                    <Code size={16} /> Generate
                </button>
            </div>

            {/* Sub-toolbar for Convert/Generate */}
            {(activeTab === 'convert' || activeTab === 'generate') && (
                <div className="flex gap-2 p-2 border-b border-slate-700 bg-slate-900/50 overflow-x-auto">
                    {activeTab === 'convert' && (
                        <>
                            {['YAML', 'XML', 'CSV'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setConversionType(type)}
                                    className={`px-3 py-1 rounded text-xs font-medium border ${conversionType === type ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </>
                    )}
                    {activeTab === 'generate' && (
                        <>
                            {['TypeScript'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setConversionType(type)}
                                    className={`px-3 py-1 rounded text-xs font-medium border ${conversionType === type ? 'bg-green-500/20 border-green-500 text-green-300' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </>
                    )}
                    <div className="flex-1" />
                    <button onClick={copyOutput} className="btn btn-ghost text-xs py-1 h-auto">
                        <Clipboard size={14} className="mr-1" /> Copy
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 relative bg-slate-950">
                {activeTab === 'preview' && (
                    <Editor
                        height="100%"
                        defaultLanguage="json"
                        theme="vs-dark"
                        value={isValid ? formatJson(jsonInput) : ''}
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: 'off',
                            scrollBeyondLastLine: false,
                            padding: { top: 16 }
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
                            fontSize: 14,
                            padding: { top: 16 }
                        }}
                    />
                )}

                {!isValid && activeTab !== 'preview' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                        <div className="text-red-400 font-mono">Fix JSON to generate output</div>
                    </div>
                )}
            </div>
        </div>
    );
}
