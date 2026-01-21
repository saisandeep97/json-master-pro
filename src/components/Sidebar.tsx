'use client';

import { FileJson, GitCompare, Settings, Sun, Moon } from 'lucide-react';
import { useGlobal } from '@/context/GlobalContext';

export default function Sidebar() {
    const { activeTab, setActiveTab, setLayoutMode, theme, toggleTheme } = useGlobal();

    const handleTabChange = (tab: 'editor' | 'diff') => {
        setActiveTab(tab);
        // Auto-switch layout based on tab
        if (tab === 'diff') setLayoutMode('diff');
        else setLayoutMode('split');
    };

    return (
        <div className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-4 shrink-0 z-20">
            {/* Logo */}
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-indigo-500/30 mb-2">
                J
            </div>

            {/* Main Navigation */}
            <div className="flex flex-col gap-2">
                <NavItem
                    icon={<FileJson size={22} />}
                    label="Editor"
                    isActive={activeTab === 'editor'}
                    onClick={() => handleTabChange('editor')}
                />
                <NavItem
                    icon={<GitCompare size={22} />}
                    label="Compare"
                    isActive={activeTab === 'diff'}
                    onClick={() => handleTabChange('diff')}
                />
            </div>

            <div className="flex-1" />

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Settings */}
            <NavItem
                icon={<Settings size={22} />}
                label="Settings"
                isActive={activeTab === 'settings'}
                onClick={() => setActiveTab('settings')}
            />
        </div>
    );
}

function NavItem({
    icon,
    label,
    isActive,
    onClick
}: {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`
                w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 relative group
                ${isActive
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
            `}
            title={label}
        >
            {icon}

            {/* Tooltip */}
            <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs font-medium rounded-md shadow-lg border border-slate-700 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {label}
            </div>

            {/* Active Indicator */}
            {isActive && (
                <div className="absolute -right-[17px] top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-l-full" />
            )}
        </button>
    );
}
