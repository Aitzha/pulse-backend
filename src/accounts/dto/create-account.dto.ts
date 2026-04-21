import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  provider!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsNumber()
  initialBalance!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;
}
