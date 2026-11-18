import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { contentTokens, sameWord } from './amharic-text';

export const LEYU_DATASET = 'gheero-Leyu/leyu-amharic-addis-ababa-dialect';

interface CorpusFile {
  texts: string[];
}

interface CorpusSentence {
  text: string;
  tokens: string[];
}

export interface CorpusMatch {
  text: string;
  hits: number;
  coverage: number;
}

let sentences: CorpusSentence[] | null = null;

function loadSentences(): CorpusSentence[] {
  if (sentences) return sentences;
  const file = JSON.parse(readFileSync(join(__dirname, 'leyu-addis-texts.json'), 'utf8')) as CorpusFile;
  const loaded: CorpusSentence[] = [];
  for (const passage of file.texts) {
    const parts = passage
      .split(/።+/)
      .map((part) => part.trim())
      .filter(Boolean);
    for (const part of parts.length > 0 ? parts : [passage]) {
      const tokens = contentTokens(part);
      if (tokens.length === 0) continue;
      loaded.push({ text: `${part}።`, tokens });
    }
  }
  sentences = loaded;
  return loaded;
}

export function leyuPassageCount(): number {
  const file = JSON.parse(readFileSync(join(__dirname, 'leyu-addis-texts.json'), 'utf8')) as CorpusFile;
  return file.texts.length;
}

export function bestLeyuMatch(queryTokens: string[]): CorpusMatch | null {
  if (queryTokens.length === 0) return null;
  let best: CorpusMatch | null = null;
  for (const sentence of loadSentences()) {
    let hits = 0;
    for (const token of queryTokens) {
      if (sentence.tokens.some((word) => sameWord(token, word))) hits += 1;
    }
    if (hits === 0) continue;
    const coverage = hits / queryTokens.length;
    const candidate = { text: sentence.text, hits, coverage };
    if (!best || betterMatch(candidate, best)) best = candidate;
  }
  return best;
}

function betterMatch(next: CorpusMatch, current: CorpusMatch): boolean {
  if (next.hits !== current.hits) return next.hits > current.hits;
  if (next.coverage !== current.coverage) return next.coverage > current.coverage;
  return next.text.length < current.text.length;
}
