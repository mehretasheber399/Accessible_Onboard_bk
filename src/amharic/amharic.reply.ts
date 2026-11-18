import { STARTER_JOBS } from '../jobs/starter-jobs';
import { contentTokens, foldAmharic, hasPhrase, replyLanguage, type ReplyLanguage } from './amharic-text';
import { bestLeyuMatch, LEYU_DATASET } from './leyu-corpus';

export interface TalkJob {
  id: string;
  title: string;
  organization: string;
  location: string;
  summary: string;
  supports: string[];
}

export interface AmharicReply {
  language: ReplyLanguage;
  dialect: 'addis-ababa';
  intent: 'greet' | 'thanks' | 'help' | 'jobs' | 'job' | 'apply' | 'account' | 'supports' | 'corpus' | 'clarify';
  reply: string;
  fromCorpus: boolean;
  source: string;
}

interface Voice {
  title: string;
  summary: string;
  aliases: string[];
}

const VOICE: Record<string, Voice> = {
  'customer-support-assistant': {
    title: 'የደንበኛ ድጋፍ ረዳት',
    summary: 'ደንበኞችን በስልክ እና በመልእክት ይረዳሉ። ስልጠና እና ግልጽ መመሪያ አለ።',
    aliases: ['customer support', 'የደንበኛ ድጋፍ', 'ደንበኛ ድጋፍ'],
  },
  'junior-data-clerk': {
    title: 'የመረጃ ጸሐፊ',
    summary: 'ቀላል የማድረስ መዝገቦችን ከቤት ይመለከታሉ፣ ያስተካክላሉ።',
    aliases: ['data clerk', 'የመረጃ ጸሐፊ', 'bright path', 'የማድረስ መዝገብ'],
  },
  'workshop-assistant': {
    title: 'የስልጠና አዳራሽ ረዳት',
    summary: 'ተማሪዎችን ይቀበላሉ፣ ቁሳቁስ ያዘጋጃሉ፣ ክፍሉም ለመንቀሳቀስ ቀላል እንዲሆን ይጠብቃሉ።',
    aliases: ['workshop assistant', 'unity hall', 'የስልጠና አዳራሽ', 'ዩኒቲ ሆል'],
  },
  'community-guide': {
    title: 'የማህበረሰብ መረጃ አቅራቢ',
    summary: 'ዝማኔን በጽሑፍ እና በጽሑፍ መግለጫ ባለው የቪዲዮ ጥሪ ከትንሽ ቡድን ጋር ያጋራሉ።',
    aliases: ['community guide', 'የማህበረሰብ መረጃ'],
  },
};

const SUPPORT_AM: Record<string, string> = {
  screen: 'ማያ ገጽ አንባቢ',
  step: 'ደረጃ በደረጃ መመሪያ',
  flexible: 'ተለዋዋጭ ሰዓት',
  written: 'በጽሑፍ መስራት',
  sign: 'የምልክት ቋንቋ',
};

const SUPPORT_EN: Record<string, string> = {
  screen: 'a screen reader',
  step: 'step-by-step instructions',
  flexible: 'flexible hours',
  written: 'working in writing',
  sign: 'sign language',
};

const INTENTS: Array<{ id: AmharicReply['intent']; phrases: string[] }> = [
  { id: 'apply', phrases: ['apply', 'application', 'ማመልከቻ', 'አመልክት', 'ላመልክት', 'አመልካች'] },
  {
    id: 'account',
    phrases: ['register', 'sign in', 'sign-in', 'log in', 'login', 'password', 'መለያ', 'ምዝገባ', 'የይለፍ ቃል', 'ኢሜይል'],
  },
  {
    id: 'supports',
    phrases: [
      'screen reader',
      'sign language',
      'step by step',
      'accessibility',
      'ተደራሽ',
      'ማያ ገጽ',
      'የምልክት ቋንቋ',
      'ደረጃ በደረጃ',
      'ተለዋዋጭ ሰዓት',
    ],
  },
  { id: 'jobs', phrases: ['job', 'jobs', 'vacancy', 'opening', 'ስራ', 'ሥራ', 'ቅጥር', 'የስራ እድል', 'የሥራ እድል'] },
  { id: 'help', phrases: ['what can you', 'help me', 'ምን ትችላለህ', 'ምን ትችያለሽ', 'እንዴት ትረዳለህ', 'ምን ትረዳለህ'] },
  { id: 'thanks', phrases: ['thank you', 'thanks', 'አመሰግናለሁ', 'አመሰግናለው', 'አመሰግን'] },
  {
    id: 'greet',
    phrases: ['hello', 'hi', 'hey', 'good morning', 'ሰላም', 'ጤና ይስጥልኝ', 'እንደምን', 'ደህና ነህ', 'ደህና ነሽ', 'እንዴት ነህ', 'እንኳን'],
  },
];

const PRODUCT_OVER_CORPUS = new Set<AmharicReply['intent']>(['apply', 'account', 'supports', 'help', 'thanks']);

export function starterTalkJobs(): TalkJob[] {
  return STARTER_JOBS.map((job) => ({
    id: job.id,
    title: job.title,
    organization: job.organization,
    location: job.location,
    summary: job.summary,
    supports: [...job.supports],
  }));
}

export function replyInAddisAmharic(message: string, jobs: TalkJob[]): AmharicReply {
  const language = replyLanguage(message);
  const folded = foldAmharic(message);
  const tokens = contentTokens(message);
  const named = namedJob(folded, jobs);
  if (named) return done(language, 'job', jobDetail(named, language), false);

  const intent = matchIntent(folded, tokens.length);
  const corpus = bestLeyuMatch(tokens);
  const strongCorpus = corpus !== null && corpus.hits >= 4 && corpus.coverage >= 0.45 && tokens.length >= 6;

  if (intent && PRODUCT_OVER_CORPUS.has(intent)) return done(language, intent, productReply(intent, language), false);
  if (strongCorpus && corpus) return corpusReply(corpus);
  if (intent) return done(language, intent, productReply(intent, language, jobs), false);
  if (corpus && ((corpus.hits >= 3 && corpus.coverage >= 0.34) || (corpus.hits >= 2 && corpus.coverage >= 0.5))) {
    return corpusReply(corpus);
  }
  return done(language, 'clarify', clarify(language), false);
}

function done(
  language: ReplyLanguage,
  intent: AmharicReply['intent'],
  reply: string,
  fromCorpus: boolean,
): AmharicReply {
  return {
    language,
    dialect: 'addis-ababa',
    intent,
    reply,
    fromCorpus,
    source: fromCorpus ? LEYU_DATASET : 'allways',
  };
}

function corpusReply(match: { text: string }): AmharicReply {
  return done('am', 'corpus', asConversation(match.text), true);
}

function asConversation(text: string): string {
  let line = text.replace(/\s+/g, ' ').trim();
  if (line.length > 240) {
    const window = line.slice(0, 240);
    const pause = Math.max(window.lastIndexOf('፣'), window.lastIndexOf('፤'));
    line = (pause > 90 ? line.slice(0, pause) : window).replace(/[፣፤\s]+$/, '');
    if (!/[።!?]$/.test(line)) line = `${line}።`;
  }
  if (line.startsWith('አዎ') || line.startsWith('እሺ') || line.startsWith('በእርግጥ')) return line;
  return `እሺ። ${line}`;
}

function matchIntent(folded: string, tokenCount: number): AmharicReply['intent'] | null {
  for (const intent of INTENTS) {
    if (intent.id === 'greet' && tokenCount > 8) continue;
    if (intent.id === 'thanks' && tokenCount > 8) continue;
    if (intent.phrases.some((phrase) => hasPhrase(folded, phrase))) return intent.id;
  }
  return null;
}

function namedJob(folded: string, jobs: TalkJob[]): TalkJob | null {
  let best: { job: TalkJob; length: number } | null = null;
  for (const job of jobs) {
    const phrases = [...(VOICE[job.id]?.aliases ?? []), job.title, job.organization];
    for (const phrase of phrases) {
      const needle = foldAmharic(phrase.trim());
      if (needle.length < 4 || !folded.includes(needle)) continue;
      if (!best || needle.length > best.length) best = { job, length: needle.length };
    }
  }
  return best?.job ?? null;
}

function productReply(intent: AmharicReply['intent'], language: ReplyLanguage, jobs: TalkJob[] = []): string {
  if (intent === 'jobs') return jobsReply(jobs, language);
  if (language === 'en') return ENGLISH[intent] ?? ENGLISH.clarify;
  return AMHARIC[intent] ?? AMHARIC.clarify;
}

const AMHARIC: Record<string, string> = {
  greet:
    'ሰላም፣ እንኳን ደህና መጡ። እኔ የAllWays ረዳት ነኝ። ስለ ሥራ፣ ስለ ማመልከቻ እና ስለ መለያ በአዲስ አበባ አማርኛ እረዳዎታለሁ። ምን ልንገርዎ?',
  thanks: 'አመሰግናለሁ። ሌላ የሚያስፈልግዎት ነገር ካለ እዚህ አለሁ።',
  help: 'ስለ ክፍት ሥራ፣ ስለ አንድ ሥራ ዝርዝር፣ ስለ ማመልከቻ፣ ስለ መለያ እና ስለ ተደራሽነት ድጋፍ ልነግርዎ እችላለሁ። በተጨማሪም ስለ ቤተሰብ፣ ጎረቤት ወይም የአዲስ አበባ ኑሮ ቢጠይቁ፣ ከሌዩ ንግግር በተፈጥሯዊ አማርኛ እመልሳለሁ።',
  apply:
    'እሺ። ማመልከቻ ለመጀመር የሥራውን ስም ይንገሩኝ። ከዚያ ስምዎን፣ ስልክ ወይም ኢሜይል፣ እና ልምድዎን እንቀበላለን። ሲያልቅ እንደ ኦፒ-ጆብ-4821 ያለ የማጣቀሻ ቁጥር ይሰጥዎታል።',
  account:
    'መለያ ለመክፈት ስም፣ ኢሜይል እና የይለፍ ቃል ይበቃል። ያ ኢሜይል አስቀድሞ ከተመዘገበ እንነግርዎታለን። ለመግባት ያንኑ ኢሜይል እና የይለፍ ቃል ይጠቀሙ። ኢሜይሉ ካልተገኘ መጀመሪያ ይመዝገቡ።',
  supports:
    'አዎ። እነዚህ ሥራዎች ተደራሽ እንዲሆኑ ድጋፍ አላቸው። ለምሳሌ ማያ ገጽ አንባቢ፣ ደረጃ በደረጃ መመሪያ፣ ተለዋዋጭ ሰዓት፣ በጽሑፍ መስራት እና የምልክት ቋንቋ።',
  clarify: 'ይቅርታ፣ ይህን ሙሉ በሙሉ አልያዝኩትም። ስለ ሥራ፣ ስለ ማመልከቻ፣ ወይም ስለ አንድ ጉዳይ ትንሽ ግልጽ አድርገው ቢሉኝ እመልሳለሁ።',
};

const ENGLISH: Record<string, string> = {
  greet:
    'Hello, and welcome. I am the AllWays assistant. I can help with jobs, applications, and accounts. If you write in Amharic, I answer in everyday Addis Ababa speech. What should I explain?',
  thanks: 'Thank you. I am here if you need something else.',
  help: 'I can explain open jobs, one job in detail, how to apply, accounts, and accessibility support. Questions about daily life in Addis Ababa can be answered from the Leyu conversations, in natural Amharic.',
  apply:
    'To apply, tell me the job name. We then ask for your name, a phone number or email, and your experience. When it is saved you get a reference such as OP-JOB-4821.',
  account:
    'To open an account, send your name, email, and a password. If that email is already registered, we say so. To sign in, use the same email and password. If the email is new, register first.',
  supports:
    'These jobs can include support so more people can take part. For example, a screen reader, step-by-step instructions, flexible hours, working in writing, and sign language.',
  clarify: 'I did not quite catch that. Ask about a job, an application, or say a little more about the topic.',
};

function jobsReply(jobs: TalkJob[], language: ReplyLanguage): string {
  if (jobs.length === 0) {
    return language === 'am'
      ? 'አሁን በቦርዱ ላይ የተመዘገበ ሥራ የለም። ትንሽ ቆይተው እንደገና ይጠይቁ።'
      : 'There are no jobs on the board right now. Check again in a little while.';
  }
  const shown = jobs.slice(0, 4);
  if (language === 'en') {
    const lines = shown.map((job) => `${job.title} at ${job.organization}, ${job.location}.`).join(' ');
    const more = jobs.length > 4 ? ` There are ${jobs.length - 4} more.` : '';
    return `Yes. These roles are open now. ${lines}${more} Tell me which one you want explained.`;
  }
  const lines = shown.map((job) => `${spokenTitle(job)}፣ ${job.organization}፣ ${placeAm(job.location)}።`).join(' ');
  const more = jobs.length > 4 ? ' ሌሎችም አሉ።' : '';
  return `አዎ፣ አሁን ያሉ ሥራዎች እነዚህ ናቸው። ${lines}${more} የትኛውን በዝርዝር ልንገርዎ?`;
}

function jobDetail(job: TalkJob, language: ReplyLanguage): string {
  const supports = job.supports.map((id) => (language === 'am' ? SUPPORT_AM[id] : SUPPORT_EN[id]) ?? id);
  const supportText = joinList(supports.filter(Boolean), language);
  if (language === 'en') {
    const supportLine = supportText ? ` Support includes ${supportText}.` : '';
    return `${job.title} is with ${job.organization}. The location is ${job.location}. ${job.summary}${supportLine} To apply, send your name, phone or email, and experience.`;
  }
  const voice = VOICE[job.id];
  const title = voice?.title ?? job.title;
  const summary = voice?.summary ?? (replyLanguage(job.summary) === 'am' ? job.summary : `ስለ ሥራው እንዲህ ተብሏል፦ ${job.summary}`);
  const supportLine = supportText ? ` ድጋፉ ${supportText} ነው።` : '';
  return `አዎ። ${title} በ${job.organization} ነው። ቦታው ${placeAm(job.location)} ነው። ${summary}${supportLine} ለማመልከት ስምዎን፣ ስልክዎን እና ልምድዎን ይላኩ።`;
}

function spokenTitle(job: TalkJob): string {
  return VOICE[job.id]?.title ?? job.title;
}

function placeAm(location: string): string {
  const value = location.toLowerCase();
  if (value.includes('remote')) return 'ከቤት';
  if (value.includes('addis') && value.includes('hybrid')) return 'አዲስ አበባ፣ ቅይጥ';
  if (value.includes('addis') && (value.includes('on-site') || value.includes('onsite'))) return 'አዲስ አበባ፣ በቦታው';
  if (value.includes('addis')) return 'አዲስ አበባ';
  return location;
}

function joinList(items: string[], language: ReplyLanguage): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  const conjunction = language === 'am' ? 'እና' : 'and';
  return `${items.slice(0, -1).join(language === 'am' ? '፣ ' : ', ')} ${conjunction} ${items[items.length - 1]}`;
}

function clarify(language: ReplyLanguage): string {
  return language === 'am' ? AMHARIC.clarify : ENGLISH.clarify;
}
