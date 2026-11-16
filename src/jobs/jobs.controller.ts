import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApplicationResponseDto, CreateGatewayApplicationDto } from '../applications/application.dto';
import { ApplicationsService } from '../applications/applications.service';
import { CreateJobDto, JobResponseDto } from './job.dto';
import { toJobResponse, JobsService } from './jobs.service';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobs: JobsService,
    private readonly applications: ApplicationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Learner job board, newest posts first' })
  @ApiOkResponse({ type: JobResponseDto, isArray: true })
  list(): Promise<JobResponseDto[]> {
    return this.jobs.list();
  }

  @Post()
  @ApiOperation({ summary: 'Employer job post' })
  @ApiCreatedResponse({ type: JobResponseDto })
  create(@Body() dto: CreateJobDto): Promise<JobResponseDto> {
    return this.jobs.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'One job' })
  @ApiOkResponse({ type: JobResponseDto })
  @ApiNotFoundResponse({ description: 'Job is not on the board' })
  async findOne(@Param('id') id: string): Promise<JobResponseDto> {
    const job = await this.jobs.findOne(id);
    if (!job) throw new NotFoundException('That job is not on the board.');
    return toJobResponse(job);
  }

  @Get(':id/applications')
  @ApiOperation({ summary: 'Applications saved for one job' })
  @ApiOkResponse({ type: ApplicationResponseDto, isArray: true })
  listApplications(@Param('id') id: string): Promise<ApplicationResponseDto[]> {
    return this.applications.listForJob(id);
  }

  @Post(':id/applications')
  @ApiOperation({ summary: 'Career gateway application' })
  @ApiCreatedResponse({ type: ApplicationResponseDto })
  apply(
    @Param('id') id: string,
    @Body() dto: CreateGatewayApplicationDto,
  ): Promise<ApplicationResponseDto> {
    return this.applications.createForJob(id, dto);
  }
}
