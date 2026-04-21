import { PartialType } from '@nestjs/mapped-types';
import { CreateLiabilityDto } from './create-liability.dto.js';

export class UpdateLiabilityDto extends PartialType(CreateLiabilityDto) {}
