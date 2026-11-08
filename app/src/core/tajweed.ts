// Tajwīd colours. The "quran-tajweed" text (AlQuran Cloud) marks the rules inline: [code[letters] or [code:id[letters].
// parseTajweed turns a verse into plain text pieces with the rule that applies to each.

export type TajweedRule = 'hamza_wasl' | 'silent' | 'lam_shamsiyya' | 'madd_normal' | 'madd_permissible' | 'madd_necessary' | 'madd_obligatory'
  | 'qalqala' | 'ikhfa_shafawi' | 'ikhfa' | 'idgham_shafawi' | 'iqlab' | 'idgham_ghunna' | 'idgham_no_ghunna' | 'idgham_mutajanisayn' | 'idgham_mutaqaribayn' | 'ghunna';

const CODES: Record<string, TajweedRule> = {
  h: 'hamza_wasl', s: 'silent', l: 'lam_shamsiyya', n: 'madd_normal', p: 'madd_permissible', m: 'madd_necessary', o: 'madd_obligatory',
  q: 'qalqala', c: 'ikhfa_shafawi', f: 'ikhfa', w: 'idgham_shafawi', i: 'iqlab', a: 'idgham_ghunna', u: 'idgham_no_ghunna',
  d: 'idgham_mutajanisayn', b: 'idgham_mutaqaribayn', g: 'ghunna',
};

/** Colours (dark theme / light theme) close to the usual colour-coded muṣḥaf. */
export const TAJWEED_COLORS: Record<TajweedRule, [string, string]> = {
  hamza_wasl: ['#8C9A98', '#9A9A9A'], silent: ['#8C9A98', '#9A9A9A'], lam_shamsiyya: ['#8C9A98', '#9A9A9A'],
  madd_normal: ['#E0A3FF', '#9B3DB8'], madd_permissible: ['#FF9F5A', '#D2691E'], madd_necessary: ['#FF6B6B', '#B5121B'], madd_obligatory: ['#FF5C8A', '#C2185B'],
  qalqala: ['#6FB8FF', '#1565C0'], ikhfa_shafawi: ['#FF8FD0', '#D81B60'], ikhfa: ['#C9A0FF', '#7E57C2'], idgham_shafawi: ['#7FE0A0', '#2E7D32'],
  iqlab: ['#5EE0E0', '#00838F'], idgham_ghunna: ['#7FE0A0', '#2E7D32'], idgham_no_ghunna: ['#B4D96B', '#558B2F'],
  idgham_mutajanisayn: ['#B4D96B', '#558B2F'], idgham_mutaqaribayn: ['#B4D96B', '#558B2F'], ghunna: ['#FFB347', '#EF6C00'],
};

export type Piece = { text: string; rule?: TajweedRule };

export function parseTajweed(src: string): Piece[] {
  const out: Piece[] = [];
  const re = /\[([a-z])(?::\d+)?\[([^\]]*)\]/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push({ text: src.slice(last, m.index) });
    out.push({ text: m[2], rule: CODES[m[1]] });
    last = re.lastIndex;
  }
  if (last < src.length) out.push({ text: src.slice(last) });
  // join neighbours with the same rule
  return out.filter(p => p.text).reduce<Piece[]>((a, p) => {
    const prev = a[a.length - 1];
    if (prev && prev.rule === p.rule) prev.text += p.text; else a.push({ ...p });
    return a;
  }, []);
}

export const plainOf = (pieces: Piece[]) => pieces.map(p => p.text).join('');

/** Removes the leading basmala (the first four words) from verse 1 of a sūra other than 1 and 9. */
export function dropBasmala(pieces: Piece[]): Piece[] {
  let spaces = 0;
  const out: Piece[] = [];
  let done = false;
  for (const p of pieces) {
    if (done) { out.push(p); continue; }
    let i = 0;
    for (; i < p.text.length; i++) {
      if (p.text[i] === ' ') { spaces++; if (spaces === 4) { i++; done = true; break; } }
    }
    if (done && i < p.text.length) out.push({ ...p, text: p.text.slice(i) });
  }
  return done && out.length ? out : pieces;
}

/** Rules that appear in a verse (for the legend). */
export const rulesIn = (pieces: Piece[]) => Array.from(new Set(pieces.map(p => p.rule).filter(Boolean))) as TajweedRule[];
