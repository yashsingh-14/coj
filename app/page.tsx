import HomeManager from "@/components/HomeManager";
import { supabase } from "@/lib/supabaseClient";
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  noStore(); // Aggressive cache busting

  // Fetch Trending (newest for now, or by views if available)
  const { data: trending } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch Made For You (randomized or different sort)
  const { data: madeForYou } = await supabase
    .from('songs')
    .select('*')
    .order('title', { ascending: true })
    .limit(20);

  return (
    <main>
      <HomeManager initialData={{
        trending: trending || [],
        madeForYou: madeForYou || []
      }} />
    </main>
  );
}
