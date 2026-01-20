'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type LayoutMode = 'split' | 'diff' | 'tree';
type SidebarTab = 'editor' | 'diff' | 'transform' | 'settings';
type ThemeMode = 'dark' | 'light';

interface GlobalContextType {
    layoutMode: LayoutMode;
    setLayoutMode: (mode: LayoutMode) => void;
    activeTab: SidebarTab;
    setActiveTab: (tab: SidebarTab) => void;
    fontSize: number;
    setFontSize: (size: number) => void;
    theme: ThemeMode;
    toggleTheme: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
    const [layoutMode, setLayoutMode] = useState<LayoutMode>('split');
    const [activeTab, setActiveTab] = useState<SidebarTab>('editor');
    const [fontSize, setFontSize] = useState(13);
    const [theme, setTheme] = useState<ThemeMode>('dark');

    // Initialize Theme
    useEffect(() => {
        const savedTheme = localStorage.getItem('json-master-theme') as ThemeMode;
        if (savedTheme) {
            setTheme(savedTheme);
            if (savedTheme === 'dark') document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark'); // Default to dark
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('json-master-theme', newTheme);

        // Force DOM update
        const root = document.documentElement;
        if (newTheme === 'dark') {
            root.classList.add('dark');
            root.style.colorScheme = 'dark';
        } else {
            root.classList.remove('dark');
            root.style.colorScheme = 'light';
        }
        console.log('Theme toggled to:', newTheme);
    };

    return (
        <GlobalContext.Provider value={{
            layoutMode,
            setLayoutMode,
            activeTab,
            setActiveTab,
            fontSize,
            setFontSize,
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
