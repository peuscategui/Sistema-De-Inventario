import { IsString, IsOptional } from 'class-validator';

export class UpdateColaboradorDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  cargo?: string;

  @IsString()
  @IsOptional()
  gerencia?: string;
} 