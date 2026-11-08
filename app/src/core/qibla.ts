// Direction to the Kaʿba (great circle), as degrees clockwise from true north, and the distance.
export const KAABA = { lat: 21.4225, lng: 39.8262 };
const rad = (d: number) => (d * Math.PI) / 180, deg = (r: number) => (r * 180) / Math.PI;

export function qibla(lat: number, lng: number): number {
  const φ1 = rad(lat), φ2 = rad(KAABA.lat), Δ = rad(KAABA.lng - lng);
  const y = Math.sin(Δ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δ);
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

export function distanceKm(lat: number, lng: number): number {
  const φ1 = rad(lat), φ2 = rad(KAABA.lat), Δ = rad(KAABA.lng - lng);
  return 6371 * Math.acos(Math.min(1, Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δ)));
}

/** Compass point (N, NO/NE, Ö/E …) for a bearing. */
export function compassPoint(b: number, lang: 'sv' | 'en'): string {
  const sv = ['N', 'NO', 'O', 'SO', 'S', 'SV', 'V', 'NV'], en = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return (lang === 'sv' ? sv : en)[Math.round(((b % 360) + 360) % 360 / 45) % 8];
}

/**
 * Rough magnetic declination for Scandinavia (degrees east), used when the phone gives only a magnetic heading.
 * Outside the region 0 is used. About ±2° in Sweden, which is enough to face the Qibla.
 */
export function declination(lat: number, lng: number): number {
  if (lat < 54 || lat > 71 || lng < 4 || lng > 32) return 0;
  return Math.round((0.5 * lng + 0.15 * (lat - 59) - 2) * 10) / 10;
}

/** Heading of the top of a phone lying flat, from the magnetometer (x right, y up), degrees from magnetic north. */
export function headingFromMag(x: number, y: number): number {
  return (deg(Math.atan2(-x, y)) + 360) % 360;
}

/** Smallest signed difference a − b in degrees (−180 … 180). */
export const angleDiff = (a: number, b: number) => ((((a - b) % 360) + 540) % 360) - 180;
