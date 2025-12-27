import HomeManager from "@/components/HomeManager";
import { supabase } from "@/lib/supabaseClient";
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  noStore();

  // 1. Fetch Featured Songs (Explicitly marked)
  const { data: featured } = await supabase
    .from('songs')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(10);

  // 2. Fetch Trending (Newest fallback if no view analytics yet)
  const { data: trending } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  // 3. Fetch Made For You (Randomized sort usually, simpler here)
  const { data: madeForYou } = await supabase
    .from('songs')
    .select('*')
    .order('title', { ascending: true })
    .limit(20);

  // 4. Fetch Hero Carousel Slides
  const { data: slidesData } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'home_hero_slides')
    .single();

  // 5. Fetch Today's Verse
  const today = new Date().toISOString().split('T')[0];
  const { data: verseData } = await supabase
    .from('daily_verses')
    .select('*')
    .eq('date', today)
    .single();

  // 6. Fetch Active Announcements
  const { data: announcementsData } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });


  return (
    <main>
      <HomeManager initialData={{
        trending: trending || [],
        madeForYou: madeForYou || [],
        featured: featured || [],
        heroSlides: slidesData?.value || [],
        todaysVerse: verseData || null,
        announcements: announcementsData || []
      }} />
    </main>
  );
}
