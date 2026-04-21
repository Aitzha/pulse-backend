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
import { FinancesService } from './finances.service.js';
import { CreateFinanceDto } from './dto/create-finance.dto.js';
import { UpdateFinanceDto } from './dto/update-finance.dto.js';

@Controller('finances')
@UseGuards(JwtAuthGuard)
export class FinancesController {
  constructor(private financesService: FinancesService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateFinanceDto) {
    return this.financesService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.financesService.findAllByUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.financesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateFinanceDto,
  ) {
    return this.financesService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.financesService.remove(id, req.user.userId);
  }
}
