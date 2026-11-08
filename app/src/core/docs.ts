// Text from Word (.docx) and OpenDocument (.odt) files. Both are zip archives with the text in an XML file;
// fflate unpacks them in JavaScript, so nothing leaves the phone. PDFs and pictures are read with text recognition.
import { strFromU8, unzipSync } from 'fflate';

export type DocKind = 'docx' | 'odt' | 'pdf' | 'image' | 'text' | 'unknown';

export function kindOf(name: string, mime = ''): DocKind {
  const n = name.toLowerCase();
  if (n.endsWith('.docx') || mime.includes('wordprocessingml')) return 'docx';
  if (n.endsWith('.odt') || mime.includes('opendocument.text')) return 'odt';
  if (n.endsWith('.pdf') || mime === 'application/pdf') return 'pdf';
  if (/\.(png|jpe?g|bmp|webp|gif|heic)$/.test(n) || mime.startsWith('image/')) return 'image';
  if (/\.(txt|md|csv)$/.test(n) || mime.startsWith('text/')) return 'text';
  return 'unknown';
}

const entities = (s: string) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&amp;/g, '&');

const tidy = (s: string) => s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

/** Text of word/document.xml: runs (w:t) joined, tabs and breaks kept, one line per paragraph. */
export function docxText(xml: string): string {
  const body = xml.replace(/<w:tab\/>/g, '\t').replace(/<w:(br|cr)\b[^>]*\/>/g, '\n').replace(/<\/w:p>/g, '\n');
  // text pieces and the newlines/tabs between them, in document order
  const parts: string[] = [];
  const re = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|(\n)|(\t)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) parts.push(m[1] !== undefined ? entities(m[1]) : m[2] ? '\n' : '\t');
  return tidy(parts.join(''));
}

/** Text of content.xml: paragraphs and headings, with text:s (spaces), text:tab and text:line-break. */
export function odtText(xml: string): string {
  const body = (/<office:text[^>]*>([\s\S]*)<\/office:text>/.exec(xml)?.[1] ?? xml)
    .replace(/<text:s\s+text:c="(\d+)"\s*\/>/g, (_, n) => ' '.repeat(Number(n)))
    .replace(/<text:s\s*\/>/g, ' ').replace(/<text:tab\s*\/>/g, '\t').replace(/<text:line-break\s*\/>/g, '\n')
    .replace(/<\/text:(p|h)>/g, '\n').replace(/<[^>]+>/g, '');
  return tidy(entities(body));
}

/** Text of a .docx or .odt file. */
export function officeText(bytes: Uint8Array, kind: 'docx' | 'odt'): string {
  const want = kind === 'docx' ? 'word/document.xml' : 'content.xml';
  const files = unzipSync(bytes, { filter: f => f.name === want });
  const xml = files[want];
  if (!xml) throw new Error('no text in file');
  return kind === 'docx' ? docxText(strFromU8(xml)) : odtText(strFromU8(xml));
}
