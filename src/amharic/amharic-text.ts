const FOLDS: ReadonlyArray<readonly [string, string]> = [
  ['ሐ', 'ሀ'],
  ['ሑ', 'ሁ'],
  ['ሒ', 'ሂ'],
  ['ሓ', 'ሀ'],
  ['ሔ', 'ሄ'],
  ['ሕ', 'ህ'],
  ['ሖ', 'ሆ'],
  ['ኀ', 'ሀ'],
  ['ኁ', 'ሁ'],
  ['ኂ', 'ሂ'],
  ['ኃ', 'ሀ'],
  ['ኄ', 'ሄ'],
  ['ኅ', 'ህ'],
  ['ኆ', 'ሆ'],
  ['ሃ', 'ሀ'],
  ['ሠ', 'ሰ'],
  ['ሡ', 'ሱ'],
  ['ሢ', 'ሲ'],
  ['ሣ', 'ሳ'],
  ['ሤ', 'ሴ'],
  ['ሥ', 'ስ'],
  ['ሦ', 'ሶ'],
  ['ዐ', 'አ'],
  ['ኣ', 'አ'],
  ['ዑ', 'ኡ'],
  ['ዒ', 'ኢ'],
  ['ዓ', 'አ'],
  ['ዔ', 'ኤ'],
  ['ዕ', 'እ'],
  ['ዖ', 'ኦ'],
  ['ጸ', 'ፀ'],
  ['ጹ', 'ፁ'],
  ['ጺ', 'ፂ'],
  ['ጻ', 'ፃ'],
  ['ጼ', 'ፄ'],
  ['ጽ', 'ፅ'],
  ['ጾ', 'ፆ'],
];

const STOP = new Set([
  'እና',
  'ነው',
  'ናቸው',
  'ናት',
  'ነበር',
  'ነበሩ',
  'የ',
  'በ',
  'ከ',
  'ላይ',
  'ውስጥ',
  'ነገር',
  'ግን',
  'ወይም',
  'ወይ',
  'እንዲሁ',
  'እንዲሁም',
  'ይህ',
  'እነዚህ',
  'ብዬ',
  'አለ',
  'አሉ',
  'ሲሆን',
  'ለ',
  'ወደ',
  'እንደ',
  'በጣም',
  'ብቻ',
  'ሁሉ',
  'አንድ',
  'ሌላ',
  'ደግሞ',
  'ጊዜ',
  'ስለ',
  'ማለት',
  'እኔ',
  'እኛ',
  'አንተ',
  'ነኝ',
  'ነዎት',
  'አለን',
  'ሆኖ',
  'ሆኖም',
  'በተጨማሪ',
  'በተጨማሪም',
  'ለምሳሌ',
  'ጋር',
  'ስለዚህ',
  'በዚህ',
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'from',
  'your',
  'you',
  'are',
  'was',
  'have',
  'not',
  'but',
  'about',
]);

const TOKEN = /[\u1200-\u137f\u1380-\u139fa-z0-9]+/gi;
const ETHIOPIC = /[\u1200-\u137f]/;

export type ReplyLanguage = 'am' | 'en';

export function foldAmharic(input: string): string {
  let value = input.toLowerCase();
  for (const [from, to] of FOLDS) {
    if (value.includes(from)) value = value.replaceAll(from, to);
  }
  return value;
}

export function replyLanguage(input: string): ReplyLanguage {
  const ethiopic = input.match(new RegExp(ETHIOPIC, 'g'))?.length ?? 0;
  const latin = input.match(/[a-z]/gi)?.length ?? 0;
  if (ethiopic >= 2 || ethiopic > latin) return 'am';
  return 'en';
}

export function contentTokens(input: string): string[] {
  const folded = foldAmharic(input);
  const seen = new Set<string>();
  for (const match of folded.matchAll(TOKEN)) {
    const token = match[0];
    if (token.length < 2 || STOP.has(token) || seen.has(token)) continue;
    if (/^\d+$/.test(token)) continue;
    seen.add(token);
  }
  return [...seen];
}

export function sameWord(left: string, right: string): boolean {
  if (left === right) return true;
  const [shorter, longer] = left.length <= right.length ? [left, right] : [right, left];
  const extra = longer.length - shorter.length;
  if (extra <= 0) return false;
  if (extra === 1 && shorter.length >= 2 && longer.endsWith(shorter)) return true;
  if (extra <= 2 && shorter.length >= 3 && (longer.startsWith(shorter) || longer.endsWith(shorter))) {
    return true;
  }
  return false;
}

export function hasPhrase(foldedMessage: string, phrase: string): boolean {
  const needle = foldAmharic(phrase);
  if (!needle) return false;
  if (/[a-z0-9]/.test(needle) && !ETHIOPIC.test(needle)) {
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(foldedMessage);
  }
  return foldedMessage.includes(needle);
}
