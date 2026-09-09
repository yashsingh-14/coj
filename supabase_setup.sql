-- ============================================================
-- Call of Jesus Ministries - Supabase Tables Setup
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bylvnplqvwgavaiygvoy/sql/new
-- ============================================================

-- 1. Contact Messages Table (for /contact form)
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert on contact_messages" ON public.contact_messages;
CREATE POLICY "Allow public insert on contact_messages"
    ON public.contact_messages
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service_role full access on contact_messages" ON public.contact_messages;
CREATE POLICY "Allow service_role full access on contact_messages"
    ON public.contact_messages
    FOR ALL
    TO service_role
    USING (true);


-- 2. Testimonies Table (for /share-testimony form)
CREATE TABLE IF NOT EXISTS public.testimonies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    city TEXT,
    category TEXT,
    title TEXT,
    story TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    allow_sharing BOOLEAN DEFAULT true,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert on testimonies" ON public.testimonies;
CREATE POLICY "Allow public insert on testimonies"
    ON public.testimonies
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read approved testimonies" ON public.testimonies;
CREATE POLICY "Allow public read approved testimonies"
    ON public.testimonies
    FOR SELECT
    TO anon, authenticated
    USING (is_approved = true);

DROP POLICY IF EXISTS "Allow service_role full access on testimonies" ON public.testimonies;
CREATE POLICY "Allow service_role full access on testimonies"
    ON public.testimonies
    FOR ALL
    TO service_role
    USING (true);
