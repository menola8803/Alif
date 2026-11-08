// Mosques for the map (see scripts/fetch-mosques.js for how the built-in list is made).
export type Mosque = { name: string; addr: string; city: string; lat: number; lng: number; web?: string; src: string; approx?: boolean; own?: boolean };

/** Key for a mosque the person has hidden (the place, rounded to about 10 m). */
export const mosqueKey = (m: { lat: number; lng: number }) => `${m.lat.toFixed(4)},${m.lng.toFixed(4)}`;

export const overpassQuery = '[out:json][timeout:120];area["ISO3166-1"="SE"][admin_level=2]->.se;nwr["amenity"="place_of_worship"]["religion"="muslim"](area.se);out center tags;';

/** Turns an Overpass answer into mosques (used on the phone when the built-in list is empty). */
export function fromOverpass(j: any): Mosque[] {
  return ((j?.elements ?? []) as any[]).map(e => {
    const lat = e.lat ?? e.center?.lat, lng = e.lon ?? e.center?.lon, t = e.tags ?? {};
    const street = t['addr:street'] ? `${t['addr:street']} ${t['addr:housenumber'] ?? ''}`.trim() : '';
    return { name: t['name:sv'] || t.name || 'Moské', addr: street, city: t['addr:city'] ?? '', lat: Number(lat), lng: Number(lng), web: t.website ?? '', src: 'osm' };
  }).filter(m => Number.isFinite(m.lat) && Number.isFinite(m.lng));
}

const rad = (d: number) => (d * Math.PI) / 180;
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
export const sortByDistance = (list: Mosque[], from: { lat: number; lng: number }) => [...list].sort((x, y) => distanceKm(from, x) - distanceKm(from, y));
