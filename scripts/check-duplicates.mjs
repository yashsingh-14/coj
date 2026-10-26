import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicates() {
    console.log('Fetching songs from Supabase...');
    const { data, error } = await supabase
        .from('songs')
        .select('id, title, artist, created_at')
        .order('title');

    if (error) {
        console.error('Error querying Supabase:', error);
        return;
    }

    let output = `Total Songs: ${data.length}\nGenerated: ${new Date().toISOString()}\n\n`;
    data.forEach(s => {
        output += `[${s.id}] ${s.title} - ${s.artist}\n`;
    });

    const outputPath = path.join(__dirname, '../debug_output.txt');
    fs.writeFileSync(outputPath, output, 'utf8');
    console.log(`Success: Found ${data.length} songs. Output written to ${outputPath}`);
}

checkDuplicates();
