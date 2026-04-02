const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...v] = line.split('=');
  if(key && v.length) acc[key.trim()] = v.join('=').trim().replace(/^"|"$/g, '');
  return acc;
}, {});

async function check() {
  const url = env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/songs?select=title';
  const res = await fetch(url, {
    headers: {
      'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY
    }
  });
  if(res.ok) {
    const data = await res.json();
    console.log('Total songs:', data.length);
    console.log('Titles:', data.map(d=>d.title));
  } else {
    console.log('Error', res.status, await res.text());
  }
}
check();
