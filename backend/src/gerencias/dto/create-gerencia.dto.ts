import { IsString, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreateGerenciaDto {
  @IsString()
  @Length(1, 100)
  nombre: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  descripcion?: string;

  @IsOptional()
  @IsString()
  @Length(0, 20)
  codigo?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
} 