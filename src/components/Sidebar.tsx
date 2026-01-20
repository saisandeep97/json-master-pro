'use client';

import { FileJson, GitCompare, Wand2, Settings } from 'lucide-react';
import { useGlobal } from '@/context/GlobalContext';

export default function Sidebar() {
    const { activeTab, setActiveTab, setLayoutMode } = useGlobal();

    const handleTabChange = (tab: typeof activeTab) => {
        setActiveTab(tab);
        // Auto-switch layout based on tab for convenience
        if (tab === 'diff') setLayoutMode('diff');
        else if (tab === 'editor') setLayoutMode('split');
    };

    return (
        <div className="w-16 bg-[hsl(var(--color-surface))] border-r border-[hsl(var(--color-border))] flex flex-col items-center py-4 gap-4 shrink-0 z-20">
            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                JM
            </div>

            <NavItem
                icon={<FileJson size={24} />}
                label="Editor"
                isActive={activeTab === 'editor'}
                onClick={() => handleTabChange('editor')}
            />
            <NavItem
                icon={<GitCompare size={24} />}
                label="Diff"
                isActive={activeTab === 'diff'}
                onClick={() => handleTabChange('diff')}
            />
            <NavItem
                icon={<Wand2 size={24} />}
                label="Transform"
                isActive={activeTab === 'transform'}
                onClick={() => handleTabChange('transform')}
            />

            <div className="flex-1"></div>

            <NavItem
                icon={<Settings size={24} />}
                label="Settings"
                isActive={activeTab === 'settings'}
                onClick={() => handleTabChange('settings')}
            />
        </div>
    );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative group
                ${isActive
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-surface-hover))] hover:text-[hsl(var(--color-text-main))]'}
            `}
            title={label}
        >
            {icon}
            {isActive && <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-l-full"></div>}
        </button>
    );
}
