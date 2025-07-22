import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateColaboradorDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  cargo?: string;

  @IsString()
  @IsOptional()
  gerencia?: string;

  @IsString()
  @IsOptional()
  sede?: string;
} 