import { cmpVersion } from './core/semver';

// Repository where releases are published (public, so the app can read it without signing in).
export const UPDATE_REPO = 'menola8803/Alif';

export type Release = {
  tag: string; page: string; apk?: string; notes: string;
  /** The APK's size in bytes, its SHA-256 (from the server, when published), when it was released, and a pre-release? */
  size: number; sha256: string | null; published: number; prerelease: boolean;
};

export async function latestRelease(repo = UPDATE_REPO): Promise<Release | null> {
  const r = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  // rather the file with the version in its name, else the first APK
  const apks = (j.assets ?? []).filter((a: any) => String(a.name).toLowerCase().endsWith('.apk'));
  const v = String(j.tag_name ?? '').replace(/^v/i, '');
  const apk = apks.find((a: any) => String(a.name).includes(v)) ?? apks[0];
  const digest = String(apk?.digest ?? '');
  return {
    tag: j.tag_name, page: j.html_url, apk: apk?.browser_download_url, notes: String(j.body ?? ''),
    size: Number(apk?.size ?? 0), sha256: digest.startsWith('sha256:') ? digest.slice(7).toLowerCase() : null,
    published: Date.parse(j.published_at ?? '') || 0, prerelease: !!j.prerelease,
  };
}

/**
 * The release notes in the app's language. A release body holds both languages between the markers
 * <!-- lang:sv --> and <!-- lang:en --> (written by the release workflow from CHANGELOG.md and CHANGELOG.en.md).
 */
export function notesFor(body: string, lang: 'sv' | 'en'): string {
  const m = new RegExp(`<!--\\s*lang:${lang}\\s*-->([\\s\\S]*?)(?=<!--\\s*lang:|$)`).exec(body);
  const text = m ? m[1] : body.includes('<!--') ? '' : body;
  return text.replace(/\*\*Full Changelog\*\*:.*$/gm, '').replace(/^#+\s*/gm, '').replace(/\*\*/g, '').trim().slice(0, 700);
}

/** "What's new" as a short list: the bullet points of the release notes in the app's language (at most 8). */
export function notesList(body: string, lang: 'sv' | 'en'): string[] {
  const text = notesFor(body, lang);
  const bullets = text.split('\n').map(l => l.trim()).filter(l => /^[-*] /.test(l))
    .map(l => l.slice(2).replace(/`/g, '').trim()).filter(Boolean);
  if (bullets.length) return bullets.slice(0, 8);
  const first = text.split('\n').map(l => l.trim()).find(l => l && !/^\d/.test(l));
  return first ? [first.length > 140 ? `${first.slice(0, 140).trimEnd()}…` : first] : [];
}

export const isNewer = (tag: string, current: string) => cmpVersion(tag, current) > 0;
