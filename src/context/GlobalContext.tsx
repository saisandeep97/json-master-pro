'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type LayoutMode = 'split' | 'diff';
type SidebarTab = 'editor' | 'diff' | 'settings';
type ThemeMode = 'dark' | 'light';

interface GlobalContextType {
    layoutMode: LayoutMode;
    setLayoutMode: (mode: LayoutMode) => void;
    activeTab: SidebarTab;
    setActiveTab: (tab: SidebarTab) => void;
    theme: ThemeMode;
    toggleTheme: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
    const [layoutMode, setLayoutMode] = useState<LayoutMode>('split');
    const [activeTab, setActiveTab] = useState<SidebarTab>('editor');
    const [theme, setTheme] = useState<ThemeMode>('dark');

    // Initialize Theme
    useEffect(() => {
        const savedTheme = localStorage.getItem('json-master-theme') as ThemeMode;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        } else {
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('json-master-theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        document.documentElement.style.colorScheme = newTheme;
    };

    return (
        <GlobalContext.Provider value={{
            layoutMode,
            setLayoutMode,
            activeTab,
            setActiveTab,
            theme,
            toggleTheme
        }}>
            {children}
        </GlobalContext.Provider>
    );
}

export function useGlobal() {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobal must be used within a GlobalProvider');
    }
    return context;
}
