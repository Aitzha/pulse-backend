import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ActivitiesService } from './activities.service.js';
import { CreateActivityDto } from './dto/create-activity.dto.js';
import { QueryActivityDto } from './dto/query-activity.dto.js';
import { UpdateActivityDto } from './dto/update-activity.dto.js';

interface AuthedRequest {
  user: { userId: string; username: string };
}

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private activitiesService: ActivitiesService) {}

  @Post()
  create(@Request() req: AuthedRequest, @Body() dto: CreateActivityDto) {
    return this.activitiesService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req: AuthedRequest, @Query() query: QueryActivityDto) {
    return this.activitiesService.findAllByUser(req.user.userId, query);
  }

  @Get(':id')
  findOne(@Request() req: AuthedRequest, @Param('id') id: string) {
    return this.activitiesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Request() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateActivityDto,
  ) {
    return this.activitiesService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  remove(@Request() req: AuthedRequest, @Param('id') id: string) {
    return this.activitiesService.remove(id, req.user.userId);
  }
}
