export default function AdBanner() {
    return (
        <div className="w-full h-24 bg-surface border border-dashed border-slate-700 flex items-center justify-center rounded-lg my-4 text-muted text-sm">
            <div className="text-center">
                <p>Google AdSense Banner</p>
                <p className="text-xs opacity-50">(Place your ad code here)</p>
            </div>
        </div>
    );
}
