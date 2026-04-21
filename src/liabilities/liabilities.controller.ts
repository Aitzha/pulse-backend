import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { LiabilitiesService } from './liabilities.service.js';
import { CreateLiabilityDto } from './dto/create-liability.dto.js';
import { UpdateLiabilityDto } from './dto/update-liability.dto.js';

interface AuthedRequest {
  user: { userId: string; username: string };
}

@Controller('liabilities')
@UseGuards(JwtAuthGuard)
export class LiabilitiesController {
  constructor(private liabilitiesService: LiabilitiesService) {}

  @Post()
  create(@Request() req: AuthedRequest, @Body() dto: CreateLiabilityDto) {
    return this.liabilitiesService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req: AuthedRequest) {
    return this.liabilitiesService.findAllByUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req: AuthedRequest, @Param('id') id: string) {
    return this.liabilitiesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Request() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateLiabilityDto,
  ) {
    return this.liabilitiesService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  remove(@Request() req: AuthedRequest, @Param('id') id: string) {
    return this.liabilitiesService.remove(id, req.user.userId);
  }
}
