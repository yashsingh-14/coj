import HomeManager from "@/components/HomeManager";
import { supabaseServer } from "@/lib/supabaseServer";
import { unstable_noStore as noStore } from 'next/cache';

// export const dynamic = 'force-dynamic'; // Removed to allow caching
export const revalidate = 60; // Cache for 1 minute

export default async function Home() {
  // noStore(); // Removed to allow caching

  // 1. Fetch Featured Songs (Explicitly marked)
  const { data: featured } = await supabaseServer
    .from('songs')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(10);

  // 2. Fetch Trending (Newest fallback if no view analytics yet)
  const { data: trending } = await supabaseServer
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  // 3. Fetch Made For You (Randomized sort usually, simpler here)
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


  const homepageJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://callofjesus.in/#organization',
        name: 'Call of Jesus Ministries',
        url: 'https://callofjesus.in',
        logo: {
          '@type': 'ImageObject',
          url: 'https://callofjesus.in/images/logo-main.png',
        },
        sameAs: [],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://callofjesus.in/#website',
        url: 'https://callofjesus.in',
        name: 'COJ Worship',
        description: 'Free Christian worship songs with lyrics, chords in English & Hindi',
        publisher: { '@id': 'https://callofjesus.in/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://callofjesus.in/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
      />
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
