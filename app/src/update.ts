import { cmpVersion } from './core/semver';

// Repository where releases are published (public, so the app can read it without signing in).
export const UPDATE_REPO = 'menola8803/Alif';

export type Release = { tag: string; page: string; apk?: string; notes: string };

export async function latestRelease(repo = UPDATE_REPO): Promise<Release | null> {
  const r = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  const apk = (j.assets ?? []).find((a: any) => String(a.name).toLowerCase().endsWith('.apk'));
  return { tag: j.tag_name, page: j.html_url, apk: apk?.browser_download_url, notes: String(j.body ?? '') };
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

export const isNewer = (tag: string, current: string) => cmpVersion(tag, current) > 0;
