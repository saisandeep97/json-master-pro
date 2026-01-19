export default function AdBanner() {
    return (
        <div className="w-full h-24 bg-[hsl(var(--color-surface))] border border-dashed border-[hsl(var(--color-border))] flex items-center justify-center rounded-lg my-4 text-[hsl(var(--color-text-muted))] text-sm">
            <div className="text-center">
                <p>Google AdSense Banner</p>
                <p className="text-xs opacity-50">(Place your ad code here)</p>
            </div>
        </div>
    );
}
