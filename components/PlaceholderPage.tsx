export default function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="min-h-screen bg-[#02000F] text-white flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">{title}</h1>
                <p className="text-white/50">This feature is coming soon.</p>
            </div>
        </div>
    );
}
