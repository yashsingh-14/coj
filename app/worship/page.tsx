import { supabaseServer } from "@/lib/supabaseServer";
import HomeUtilityContent from "@/components/home/HomeUtilityContent";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Worship Songs & Chords | Call of Jesus Ministries',
  description: 'Free Christian worship songs with lyrics, chords, transpose tools, and pads in English and Hindi by Call of Jesus Ministries.',
};

export const revalidate = 60; // Cache for 1 minute

export default async function WorshipPage() {
  // 1. Fetch Featured Songs
  const { data: featured } = await supabaseServer
    .from('songs')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(10);

  // 2. Fetch Trending Songs
  const { data: trending } = await supabaseServer
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  // 3. Fetch Made For You
  const { data: madeForYou } = await supabaseServer
    .from('songs')
    .select('*')
    .order('title', { ascending: true })
    .limit(20);

  // 4. Fetch Hero Carousel Slides
  const { data: slidesData } = await supabaseServer
    .from('site_settings')
    .select('value')
    .eq('key', 'home_hero_slides')
    .single();

  // 5. Fetch Today's Verse
  const today = new Date().toISOString().split('T')[0];
  const { data: verseData } = await supabaseServer
    .from('daily_verses')
    .select('*')
    .eq('date', today)
    .single();

  // 6. Fetch Active Announcements
  const { data: announcementsData } = await supabaseServer
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <main>
      <HomeUtilityContent
        trendingSongs={trending || []}
        madeForYouSongs={madeForYou || []}
        featuredSongs={featured || []}
        heroSlides={slidesData?.value || []}
        dbVerse={verseData || null}
        announcements={announcementsData || []}
      />
    </main>
  );
}
