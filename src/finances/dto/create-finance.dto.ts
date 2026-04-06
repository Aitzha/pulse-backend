import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateFinanceDto {
  @IsString()
  @IsNotEmpty()
  provider!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsNumber()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;
}
