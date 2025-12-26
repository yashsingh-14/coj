'use client';

import { useState } from 'react';
import { Share2, Copy, Check, X } from 'lucide-react';
import type { BibleVerse } from '@/data/verses';
import { toast } from 'sonner';

interface ShareButtonProps {
    verse: BibleVerse;
}

export default function ShareButton({ verse }: ShareButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareText = `📖 Verse of the Day\n\n"${verse.text}"\n\n- ${verse.reference}\n\nRead more at: ${typeof window !== 'undefined' ? window.location.origin : ''}`;

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Verse of the Day',
                    text: shareText,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            setShowModal(true);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success('Copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    const shareOnWhatsApp = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
    };

    const shareOnFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
    };

    const shareOnTwitter = () => {
        const tweetText = `"${verse.text}"\n\n- ${verse.reference}`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(url, '_blank');
    };

    return (
        <>
            <button
                onClick={handleNativeShare}
                className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full overflow-hidden transition-all hover:bg-white/10 text-sm md:text-base"
            >
                <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                <span>Share Verse</span>
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>

                    <div className="relative bg-[#111] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-2xl font-bold mb-4">Share Verse</h3>

                        <div className="space-y-3">
                            <button
                                onClick={shareOnWhatsApp}
                                className="w-full p-4 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/50 transition-all flex items-center gap-3"
                            >
                                <span className="font-bold">Share on WhatsApp</span>
                            </button>

                            <button
                                onClick={shareOnFacebook}
                                className="w-full p-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/50 transition-all flex items-center gap-3"
                            >
                                <span className="font-bold">Share on Facebook</span>
                            </button>

                            <button
                                onClick={shareOnTwitter}
                                className="w-full p-4 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 hover:border-sky-500/50 transition-all flex items-center gap-3"
                            >
                                <span className="font-bold">Share on Twitter</span>
                            </button>

                            <button
                                onClick={() => copyToClipboard(shareText)}
                                className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center gap-3"
                            >
                                {copied ? (
                                    <Check className="w-5 h-5 text-green-500" />
                                ) : (
                                    <Copy className="w-5 h-5" />
                                )}
                                <span className="font-bold">{copied ? 'Copied!' : 'Copy Verse Text'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
