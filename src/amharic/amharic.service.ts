import { BadRequestException, Injectable } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { AmharicReply, replyInAddisAmharic, starterTalkJobs, TalkJob } from './amharic.reply';

@Injectable()
export class AmharicService {
  constructor(private readonly jobs: JobsService) {}

  async reply(message: string): Promise<AmharicReply> {
    const text = message.trim();
    if (!text) throw new BadRequestException('Message is required.');
    return replyInAddisAmharic(text, await this.talkJobs());
  }

  private async talkJobs(): Promise<TalkJob[]> {
    try {
      const rows = await this.jobs.list();
      if (rows.length === 0) return starterTalkJobs();
      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        organization: row.organization,
        location: row.location,
        summary: row.summary,
        supports: row.supports,
      }));
    } catch {
      return starterTalkJobs();
    }
  }
}
