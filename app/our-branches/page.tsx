import { MapPin, Calendar, Clock, Phone, Mail, Navigation } from 'lucide-react';
import LandingNavbar from '@/components/hero/LandingNavbar';

export const metadata = {
    title: "Our Branches & Service Timings | Call of Jesus Ministries",
    description: "Find church location, service timings, and Google Maps directions for Call of Jesus Ministries Main Church Arena & extension locations."
};

const branchesData = [
    {
        id: 1,
        name: "Call of Jesus Ministries Main Church Arena",
        city: "New Delhi",
        address: "Faith Arena, Near Chhatarpur / Mehrauli Express Highway, New Delhi, 110074, India",
        timings: [
            { day: "Sunday Main Worship Service", time: "10:00 AM - 1:00 PM IST" },
            { day: "Friday Prophetic & Healing Service", time: "6:30 PM - 9:00 PM IST" }
        ],
        phone: "+91 98765 43210",
        email: "contact@callofjesus.in",
        mapUrl: "https://maps.google.com/?q=Chhatarpur+Delhi"
    },
    {
        id: 2,
        name: "Call of Jesus Ministries Extension Branch",
        city: "Mumbai",
        address: "Grace Center Auditorium, Bandra West, Mumbai, Maharashtra, 400050, India",
        timings: [
            { day: "Sunday Evening Worship", time: "5:00 PM - 7:30 PM IST" }
        ],
        phone: "+91 98765 43211",
        email: "mumbai@callofjesus.in",
        mapUrl: "https://maps.google.com/?q=Bandra+Mumbai"
    }
];

export default function OurBranchesPage() {
    return (
        <main className="min-h-screen bg-black text-white py-24 px-6 md:px-12">
            <LandingNavbar />
            <div className="max-w-7xl mx-auto space-y-16 pt-12">
                
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                        <MapPin className="w-4 h-4 text-amber-400" />
                        Church Locations & Gathering
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                        Our <span className="font-serif italic font-normal text-amber-300">Branches</span>
                    </h1>
                    <p className="text-neutral-300 text-lg md:text-xl font-light">
                        Join us live in person or connect online to experience the transforming presence of God.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {branchesData.map((branch) => (
                        <div
                            key={branch.id}
                            className="rounded-3xl bg-neutral-900/90 border border-white/15 p-8 md:p-10 space-y-6 shadow-2xl flex flex-col justify-between hover:border-amber-400/40 transition-all"
                        >
                            <div className="space-y-4">
                                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider inline-block">
                                    {branch.city} Branch
                                </span>
                                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
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
                                        <div key={idx} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                                            <span className="text-sm font-semibold text-neutral-200">{t.day}</span>
                                            <span className="text-xs text-amber-300 font-mono flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {t.time}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-2 text-xs text-neutral-400 space-y-1">
                                    <p className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                                        <span>{branch.phone}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-amber-400" />
                                        <span>{branch.email}</span>
                                    </p>
                                </div>
                            </div>

                            <a
                                href={branch.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 rounded-2xl bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-xl"
                            >
                                <Navigation className="w-4 h-4 text-black" />
                                <span>Get Google Maps Directions</span>
                            </a>
                        </div>
                    ))}
                </div>

            </div>
        </main>
    );
}
