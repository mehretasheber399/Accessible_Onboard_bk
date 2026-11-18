import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AmharicReplyRequestDto, AmharicReplyResponseDto } from './amharic.dto';
import { AmharicService } from './amharic.service';

@ApiTags('amharic')
@Controller('amharic')
export class AmharicController {
  constructor(private readonly amharic: AmharicService) {}

  @Post('reply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Understand a message and answer in spoken Addis Ababa Amharic' })
  @ApiOkResponse({ type: AmharicReplyResponseDto })
  reply(@Body() dto: AmharicReplyRequestDto): Promise<AmharicReplyResponseDto> {
    return this.amharic.reply(dto.message);
  }
}
