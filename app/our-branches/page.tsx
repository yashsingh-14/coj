import { MapPin, Calendar, Clock, Phone, Navigation } from 'lucide-react';
import LandingNavbar from '@/components/hero/LandingNavbar';

export const metadata = {
    title: "Our Branches & Service Timings | Call of Jesus Ministries",
    description: "Find church location, service timings, and Google Maps directions for Call of Jesus Ministries Church Hall, Kalyan East."
};

const branchesData = [
    {
        id: 1,
        name: "Call of Jesus Ministries Church Hall",
        city: "Kalyan East",
        address: "Near Adivali Talab, Namashkar Dhaba, Malangad Road, Kalyan East - 421306, Maharashtra, India",
        timings: [
            { day: "Sunday Worship Service", time: "10:30 AM - 1:30 PM IST" },
            { day: "Friday Bible Study", time: "7:00 PM - 9:00 PM IST" }
        ],
        phone: "+91 89283 94853",
        mapUrl: "https://maps.app.goo.gl/U6Unh6WEcAdbp89K6"
    }
];

export default function OurBranchesPage() {
    return (
        <main className="min-h-screen bg-black text-white py-16 sm:py-24 px-4 sm:px-6 md:px-12">
            <LandingNavbar />
            <div className="max-w-7xl mx-auto space-y-10 sm:space-y-16 pt-8 sm:pt-12">

                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                        <MapPin className="w-4 h-4 text-amber-400" />
                        Church Location & Gathering
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight">
                        Our <span className="font-serif italic font-normal text-amber-300">Branch</span>
                    </h1>
                    <p className="text-neutral-300 text-base sm:text-lg md:text-xl font-light">
                        Join us live in person to experience the transforming presence of God.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto">
                    {branchesData.map((branch) => (
                        <div
                            key={branch.id}
                            className="rounded-2xl sm:rounded-3xl bg-neutral-900/90 border border-white/15 p-5 sm:p-8 md:p-10 space-y-6 shadow-2xl flex flex-col justify-between hover:border-amber-400/40 transition-all"
                        >
                            <div className="space-y-4">
                                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider inline-block">
                                    {branch.city} — Main Branch
                                </span>
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                                    {branch.name}
                                </h2>
                                <p className="text-neutral-300 text-sm flex items-start gap-2 leading-relaxed">
                                    <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                                    <span>{branch.address}</span>
                                </p>

                                <div className="space-y-3 pt-4 border-t border-white/10">
                                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                                        Gathering & Timings
                                    </p>
                                    {branch.timings.map((t, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 sm:gap-0 bg-black/40 p-2.5 sm:p-3 rounded-xl border border-white/5">
                                            <span className="text-xs sm:text-sm font-semibold text-neutral-200">{t.day}</span>
                                            <span className="text-xs text-amber-300 font-mono flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {t.time}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-2 text-xs text-neutral-400 space-y-1">
                                    <a href="tel:+918928394853" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Prayer Line: {branch.phone}</span>
                                    </a>
                                </div>
                            </div>

                            <a
                                href={branch.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-xl mt-4"
                            >
                                <Navigation className="w-4 h-4 text-black" />
                                <span>Get Google Maps Directions</span>
                            </a>
                        </div>
                    ))}
                </div>

                {/* More Branches Coming Soon */}
                <div className="text-center pt-4">
                    <p className="text-sm text-white/30 italic">More branches coming soon. Stay tuned!</p>
                </div>

            </div>
        </main>
    );
}
