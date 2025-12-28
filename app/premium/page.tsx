import { Check } from 'lucide-react';

export default function PremiumPage() {
    const plans = [
        {
            name: "Free",
            price: "$0",
            period: "/month",
            features: ["Access to all lyrics", "Basic audio quality", "Ad-supported", "Community access"],
            active: true
        },
        {
            name: "Pro",
            price: "$4.99",
            period: "/month",
            features: ["Ad-free experience", "High Fidelity Audio", "Download offline", "Exclusive content"],
            active: false
        }
    ];

    return (
        <div className="min-h-screen bg-[#02000F] text-white p-6 md:p-12 pb-32 overflow-hidden relative">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-1/2 w-[60%] h-[60%] bg-amber-500/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black mb-4">Upgrade to <span className="text-amber-500">Pro</span></h1>
                    <p className="text-xl text-white/50">Unlock the full worship experience.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {plans.map((plan, i) => (
                        <div key={i} className={`relative p-8 rounded-[2rem] border ${plan.active ? 'border-white/20 bg-white/5' : 'border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-transparent'}`}>
                            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-black">{plan.price}</span>
                                <span className="text-white/40">{plan.period}</span>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feat, j) => (
                                    <li key={j} className="flex items-center gap-3">
                                        <div className={`p-1 rounded-full ${plan.active ? 'bg-white/10 text-white' : 'bg-amber-500 text-black'}`}>
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span className="text-white/80">{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                disabled={plan.active}
                                className={`w-full py-4 rounded-xl font-bold transition-all ${plan.active
                                        ? 'bg-white/5 text-white/40 cursor-default'
                                        : 'bg-amber-500 text-black hover:bg-amber-400 hover:scale-[1.02] shadow-lg shadow-amber-500/20'
                                    }`}
                            >
                                {plan.active ? 'Current Plan' : 'Upgrade Now'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
