import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class AmharicReplyRequestDto {
  @ApiProperty({ example: 'ሰላም፣ ስለ ሥራ ንገረኝ' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message!: string;
}

export class AmharicReplyResponseDto {
  @ApiProperty({ enum: ['am', 'en'], example: 'am' })
  language!: 'am' | 'en';

  @ApiProperty({ example: 'addis-ababa' })
  dialect!: 'addis-ababa';

  @ApiProperty({
    example: 'jobs',
    enum: ['greet', 'thanks', 'help', 'jobs', 'job', 'apply', 'account', 'supports', 'corpus', 'clarify'],
  })
  intent!: string;

  @ApiProperty({ example: 'አዎ፣ አሁን ያሉ ሥራዎች እነዚህ ናቸው።' })
  reply!: string;

  @ApiProperty({ example: false })
  fromCorpus!: boolean;

  @ApiProperty({ example: 'allways' })
  source!: string;
}
