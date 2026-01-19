'use client';

import { FolderOpen, Save, Link as LinkIcon, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileControlsProps {
    onLoadContent: (content: string) => void;
    currentContent: string;
}

export default function FileControls({ onLoadContent, currentContent }: FileControlsProps) {

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            onLoadContent(text);
            toast.success(`Loaded ${file.name}`);
        };
        reader.readAsText(file);
        // Reset value to allow re-uploading same file
        e.target.value = '';
    };

    const handleSaveFile = () => {
        const blob = new Blob([currentContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('File saved');
    };

    const handleUrlLoad = async () => {
        const url = prompt('Enter JSON URL:');
        if (!url) return;

        const toastId = toast.loading('Fetching...');
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            onLoadContent(JSON.stringify(json, null, 2));
            toast.success('Loaded from URL', { id: toastId });
        } catch (e: any) {
            toast.error(`Failed to load: ${e.message}`, { id: toastId });
        }
    };

    return (
        <div className="flex items-center gap-1 border-r border-slate-700 pr-2 mr-2">
            <button className="btn btn-ghost px-2 text-slate-400 hover:text-white" onClick={() => document.getElementById('file-upload')?.click()} title="Open File">
                <FolderOpen size={18} />
            </button>
            <input
                type="file"
                id="file-upload"
                className="hidden"
                style={{ display: 'none' }}
                accept=".json,.txt"
                onChange={handleFileUpload}
            />

            <button className="btn btn-ghost px-2 text-slate-400 hover:text-white" onClick={handleSaveFile} title="Save File">
                <Save size={18} />
            </button>

            <button className="btn btn-ghost px-2 text-slate-400 hover:text-white" onClick={handleUrlLoad} title="Load from URL">
                <LinkIcon size={18} />
            </button>
        </div>
    );
}
