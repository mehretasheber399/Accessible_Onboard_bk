import { Module } from '@nestjs/common';
import { JobsModule } from '../jobs/jobs.module';
import { AmharicController } from './amharic.controller';
import { AmharicService } from './amharic.service';

@Module({
  imports: [JobsModule],
  controllers: [AmharicController],
  providers: [AmharicService],
})
export class AmharicModule {}
