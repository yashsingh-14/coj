import { Metadata } from 'next';
import LandingNavbar from '@/components/hero/LandingNavbar';
import LandingFooter from '@/components/hero/LandingFooter';
import GivePageContent from '@/components/give/GivePageContent';

export const metadata: Metadata = {
    title: "Give & Partner | Call of Jesus Ministries",
    description: "Support Call of Jesus Ministries through online giving, instant UPI, dynamic QR codes, and bank transfers for Kingdom expansion, church building, and gospel outreach.",
    openGraph: {
        title: "Give & Partner | Call of Jesus Ministries",
        description: "Partner with Call of Jesus Ministries through online giving. 80G tax-deductible, instant UPI, dynamic QR code, and net banking.",
    }
};

export default function GivePage() {
    return (
        <main className="min-h-screen bg-[#07060A] text-[#F4EDE2]">
            <LandingNavbar />
            <GivePageContent />
            <LandingFooter />
        </main>
    );
}
