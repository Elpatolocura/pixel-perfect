const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
let url = ''; let key = '';
lines.forEach(l => {
  if (l.startsWith('VITE_SUPABASE_URL=')) url = l.split('=')[1].trim().replace(/^\"|\"$/g, '');
  if (l.startsWith('VITE_SUPABASE_ANON_KEY=')) key = l.split('=')[1].trim().replace(/^\"|\"$/g, '');
});

const supabase = createClient(url, key);
async function getEvents() {
  const { data, error } = await supabase.from('events').select('*').ilike('title', '%Concierto Rock al Parque%');
  console.log(JSON.stringify(data, null, 2));
}
getEvents();
