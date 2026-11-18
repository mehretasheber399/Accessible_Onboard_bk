import { BadRequestException } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { leyuPassageCount } from './leyu-corpus';
import { replyInAddisAmharic, starterTalkJobs, TalkJob } from './amharic.reply';
import { AmharicService } from './amharic.service';

const jobs = starterTalkJobs();

describe('Addis Ababa Amharic replies', () => {
  it('loads the Leyu Addis Ababa transcripts', () => {
    expect(leyuPassageCount()).toBeGreaterThan(1000);
  });

  it('greets in spoken Addis Amharic', () => {
    const reply = replyInAddisAmharic('ሰላም', jobs);

    expect(reply.language).toBe('am');
    expect(reply.intent).toBe('greet');
    expect(reply.fromCorpus).toBe(false);
    expect(reply.reply).toContain('እንኳን ደህና መጡ');
    expect(reply.reply).toContain('AllWays');
    expect(reply.source).toBe('allways');
  });

  it('lists open jobs in Amharic', () => {
    const reply = replyInAddisAmharic('ስራ አሳየኝ', jobs);

    expect(reply.intent).toBe('jobs');
    expect(reply.fromCorpus).toBe(false);
    expect(reply.reply).toContain('Selam Connect');
    expect(reply.reply).toContain('Bright Path');
    expect(reply.reply).toContain('የደንበኛ ድጋፍ ረዳት');
  });

  it('includes a posted job and says when more remain', () => {
    const posted: TalkJob = {
      id: 'coffee',
      title: 'የቡና ቤት ረዳት',
      organization: 'ቡና ቤት',
      location: 'Addis Ababa · On-site',
      summary: 'እንግዳ ይቀበላሉ።',
      supports: ['step'],
    };
    const reply = replyInAddisAmharic('ስራ አሳየኝ', [posted, ...jobs]);

    expect(reply.reply).toContain('የቡና ቤት ረዳት');
    expect(reply.reply).toContain('ሌሎችም አሉ');
  });

  it('explains one job in Amharic', () => {
    const reply = replyInAddisAmharic('የደንበኛ ድጋፍ ረዳት ንገረኝ', jobs);

    expect(reply.intent).toBe('job');
    expect(reply.reply).toContain('በስልክ');
    expect(reply.reply).toContain('Selam Connect');
  });

  it('explains how to apply in English', () => {
    const reply = replyInAddisAmharic('how do I apply', jobs);

    expect(reply.language).toBe('en');
    expect(reply.intent).toBe('apply');
    expect(reply.reply).toContain('OP-JOB-4821');
  });

  it('answers a corpus question with the Addis transcript', () => {
    const reply = replyInAddisAmharic('እኔና ጎረቤቴ በደስታም ሆነ በሀዘን ጊዜ እርስ በርሳችን', jobs);

    expect(reply.intent).toBe('corpus');
    expect(reply.fromCorpus).toBe(true);
    expect(reply.reply.startsWith('እሺ') || reply.reply.startsWith('አዎ')).toBe(true);
    expect(reply.reply.length).toBeLessThan(320);
    expect(reply.source).toBe('gheero-Leyu/leyu-amharic-addis-ababa-dialect');
    expect(reply.reply).toContain('እንረዳዳለን');
  });

  it('answers the clock-shop story from the corpus', () => {
    const reply = replyInAddisAmharic('በአዲስ አበባ ጥግ የምትገኝ አንዲት አሮጌ የሰዓት መጠገኛ ሱቅ', jobs);

    expect(reply.fromCorpus).toBe(true);
    expect(reply.reply).toContain('መጠገኛ');
  });

  it('asks for a clearer question when the words are unknown', () => {
    const reply = replyInAddisAmharic('asdf qqq zzz', jobs);

    expect(reply.intent).toBe('clarify');
    expect(reply.reply.toLowerCase()).toContain('did not quite catch');
  });

  it('uses starter jobs when the job board cannot be read', async () => {
    const service = new AmharicService({
      list: () => Promise.reject(new Error('database down')),
    } as unknown as JobsService);

    const reply = await service.reply('ሰላም');

    expect(reply.intent).toBe('greet');
  });

  it('rejects a blank message', async () => {
    const service = new AmharicService({ list: () => Promise.resolve([]) } as unknown as JobsService);

    await expect(service.reply('   ')).rejects.toBeInstanceOf(BadRequestException);
  });
});
