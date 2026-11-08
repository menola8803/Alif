// Collects the mosques in Sweden into app/assets/mosques.json for the map, so it works offline. Run by the APK
// workflows before the build (the file in the repository is an empty placeholder; the app then asks OpenStreetMap itself).
// Sources, merged with duplicates removed (same place within 250 m, or the same name within 2 km):
//   1. OpenStreetMap (Overpass API): amenity=place_of_worship + religion=muslim – exact positions
//   2. Wikidata (SPARQL): items that are a mosque (or a kind of mosque) in Sweden with coordinates
//   3. islam.se/moskeer: the list of ~234 mosques with addresses; the address is looked up on OpenStreetMap (Nominatim)
//   node scripts/fetch-mosques.js
const fs = require('fs');
const path = require('path');

const UA = 'Alif-app-build (se.sncab.alif; private use)';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function get(url, opts = {}, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url, { ...opts, headers: { 'User-Agent': UA, ...(opts.headers || {}) } });
      if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
      return r;
    } catch (e) {
      if (i >= tries) throw e;
      await sleep(4000 * i);
    }
  }
}

const rad = d => (d * Math.PI) / 180;
function meters(a, b) {
  const R = 6371000, dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/moske(n|e)?|masjid|mosque|islamiska|forening(en)?|kulturcenter|forsamling(en)?|[^a-z0-9]/g, '');
const inSweden = p => p.lat > 55 && p.lat < 69.2 && p.lng > 10.5 && p.lng < 24.3;

async function fromOsm() {
  const q = '[out:json][timeout:180];area["ISO3166-1"="SE"][admin_level=2]->.se;nwr["amenity"="place_of_worship"]["religion"="muslim"](area.se);out center tags;';
  const r = await get('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  const j = await r.json();
  return (j.elements || []).map(e => {
    const lat = e.lat ?? e.center?.lat, lng = e.lon ?? e.center?.lon, t = e.tags || {};
    const addr = [t['addr:street'] && `${t['addr:street']} ${t['addr:housenumber'] || ''}`.trim(), [t['addr:postcode'], t['addr:city']].filter(Boolean).join(' ')].filter(Boolean).join(', ');
    return { name: t['name:sv'] || t.name || '', addr, city: t['addr:city'] || '', lat, lng, web: t.website || t['contact:website'] || '', src: 'osm' };
  }).filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));
}

async function fromWikidata() {
  const q = `SELECT ?item ?name ?coord WHERE { ?item wdt:P31/wdt:P279* wd:Q32815; wdt:P17 wd:Q34; wdt:P625 ?coord.
    OPTIONAL { ?item rdfs:label ?sv FILTER(lang(?sv) = "sv") } OPTIONAL { ?item rdfs:label ?en FILTER(lang(?en) = "en") } BIND(COALESCE(?sv, ?en) AS ?name) }`;
  const r = await get('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(q), { headers: { Accept: 'application/sparql-results+json' } });
  const j = await r.json();
  return (j.results?.bindings || []).map(b => {
    const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(b.coord?.value || '');
    return m ? { name: b.name?.value || '', addr: '', city: '', lat: Number(m[2]), lng: Number(m[1]), web: '', src: 'wikidata' } : null;
  }).filter(Boolean);
}

const text = html => html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|span|li|h\d|strong|em|small)>/gi, '\n').replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#8211;|&ndash;/g, '–').replace(/&#[0-9]+;/g, '').split('\n').map(s => s.trim()).filter(Boolean);

async function fromIslamSe(known) {
  const html = await (await get('https://islam.se/moskeer/')).text();
  const items = [];
  const re = /<a[^>]+href="(https?:\/\/islam\.se\/moskeer\/[^"#]+\/#[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const parts = text(m[2]);
    if (parts.length < 2) continue;
    const [name, addr, place = ''] = parts;
    const [kommun = '', lan = ''] = place.split('·').map(s => s.trim());
    items.push({ name, addr, city: kommun, lan });
  }
  console.log(`islam.se: ${items.length} entries`);
  const out = [];
  for (const it of items) {
    // Already on the map by name nearby? Then no lookup is needed.
    if (known.some(k => norm(k.name) && norm(k.name) === norm(it.name))) continue;
    await sleep(1100); // Nominatim: at most one request per second
    try {
      const q = `${it.addr}, Sweden`;
      const r = await get(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=se&q=${encodeURIComponent(q)}`, {}, 2);
      const j = await r.json();
      if (j[0]) out.push({ name: it.name, addr: it.addr, city: it.city, lat: Number(j[0].lat), lng: Number(j[0].lon), web: '', src: 'islam.se' });
    } catch {}
  }
  return out;
}

function merge(list, add) {
  for (const p of add) {
    if (!inSweden(p)) continue;
    const dup = list.find(q => meters(p, q) < 250 || (norm(p.name) && norm(p.name) === norm(q.name) && meters(p, q) < 2000));
    if (dup) {
      if (!dup.name && p.name) dup.name = p.name;
      if (!dup.addr && p.addr) dup.addr = p.addr;
      if (!dup.city && p.city) dup.city = p.city;
      if (!dup.src.includes(p.src)) dup.src += `,${p.src}`;
    } else list.push({ ...p });
  }
  return list;
}

(async () => {
  let all = [];
  for (const [name, f] of [['OpenStreetMap', fromOsm], ['Wikidata', fromWikidata]]) {
    try { const got = await f(); merge(all, got); console.log(`${name}: ${got.length}`); } catch (e) { console.error(`${name} failed: ${e.message}`); }
  }
  try { const got = await fromIslamSe(all); merge(all, got); console.log(`islam.se (looked up): ${got.length}`); } catch (e) { console.error(`islam.se failed: ${e.message}`); }
  all = all.filter(inSweden).map(p => ({ ...p, lat: Math.round(p.lat * 1e5) / 1e5, lng: Math.round(p.lng * 1e5) / 1e5, name: p.name || 'Moské' }));
  if (all.length < 20) throw new Error(`too few mosques (${all.length})`);
  const file = path.join(__dirname, '..', 'app', 'assets', 'mosques.json');
  fs.writeFileSync(file, JSON.stringify({ updated: new Date().toISOString().slice(0, 10), sources: 'OpenStreetMap (ODbL), Wikidata (CC0), islam.se', mosques: all }));
  console.log(`wrote ${file}: ${all.length} mosques`);
})().catch(e => { console.error(e); process.exit(1); });
