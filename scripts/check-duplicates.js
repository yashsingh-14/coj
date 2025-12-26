
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicates() {
    const { data, error } = await supabase
        .from('songs')
        .select('id, title, artist, created_at')
        .order('title');

    if (error) {
        console.error('Error:', error);
        return;
    }

    const fs = require('fs');
    const path = require('path');

    let output = `Total Songs: ${data.length}\n`;
    data.forEach(s => {
        output += `[${s.id}] ${s.title} - ${s.artist}\n`;
    });

    fs.writeFileSync(path.join(__dirname, '../debug_output.txt'), output, 'utf8');
    console.log("Output written to debug_output.txt");
}

checkDuplicates();
