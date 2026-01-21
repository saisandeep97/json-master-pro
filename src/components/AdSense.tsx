'use client';

import { useEffect } from 'react';

interface AdSenseProps {
    adSlot: string;
    adFormat?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
    className?: string;
}

// Replace with your actual AdSense Publisher ID
const ADSENSE_PUBLISHER_ID = 'ca-pub-XXXXXXXXXX';

export default function AdSense({ adSlot, adFormat = 'auto', className = '' }: AdSenseProps) {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, []);

    // Show placeholder in development
    if (process.env.NODE_ENV === 'development') {
        return (
            <div className={`bg-slate-800/50 border border-dashed border-slate-600 rounded-lg flex items-center justify-center text-slate-500 text-xs ${className}`}>
                <div className="text-center p-2">
                    <span className="opacity-50">📢 Ad Placeholder</span>
                    <br />
                    <span className="text-[10px] opacity-30">{adSlot || 'Configure ad-slot'}</span>
                </div>
            </div>
        );
    }

    return (
        <ins
            className={`adsbygoogle ${className}`}
            style={{ display: 'block' }}
            data-ad-client={ADSENSE_PUBLISHER_ID}
            data-ad-slot={adSlot}
            data-ad-format={adFormat}
            data-full-width-responsive="true"
        />
    );
}

// Horizontal banner ad (header/footer)
export function AdBanner({ className = '' }: { className?: string }) {
    return (
        <AdSense
            adSlot="YOUR_BANNER_AD_SLOT"
            adFormat="horizontal"
            className={`h-[90px] w-full ${className}`}
        />
    );
}

// Sidebar ad (vertical)
export function AdSidebar({ className = '' }: { className?: string }) {
    return (
        <AdSense
            adSlot="YOUR_SIDEBAR_AD_SLOT"
            adFormat="vertical"
            className={`w-full min-h-[250px] ${className}`}
        />
    );
}
