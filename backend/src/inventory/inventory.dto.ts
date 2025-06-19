import { IsString, IsInt, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  codigoEFC: string;

  @IsString()
  tipoEquipo: string;

  @IsString()
  familia: string;

  @IsOptional()
  @IsString()
  subFamilia?: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsString()
  modelo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  serie?: string;

  @IsString()
  procesador: string;

  @IsOptional()
  @IsInt()
  anio?: number;

  @IsString()
  ram: string;

  @IsString()
  discoDuro: string;

  @IsString()
  sistemaOperativo: string;

  @IsString()
  sede: string;

  @IsString()
  estado: string;

  @IsOptional()
  @IsString()
  usuarios?: string;

  @IsString()
  cargo: string;

  @IsString()
  gerencia: string;

  @IsString()
  ubicacionEquipo: string;

  @IsInt()
  qUsuarios: number;

  @IsOptional()
  @IsString()
  condicion?: string;

  @IsOptional()
  repotenciadas?: boolean;

  @IsOptional()
  @IsString()
  clasificacionObsolescencia?: string;

  @IsOptional()
  @IsString()
  clasificacionRepotenciadas?: string;

  @IsOptional()
  @IsString()
  motivoCompra?: string;

  @IsOptional()
  @IsNumber()
  precioReposicion?: number;

  @IsOptional()
  @IsString()
  proveedor?: string;

  @IsOptional()
  @IsString()
  factura?: string;

  @IsOptional()
  @IsInt()
  anioCompra?: number;

  @IsOptional()
  @IsNumber()
  precioReposicion2024?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsString()
  vidaUtil?: string;

  @IsOptional()
  @IsDateString()
  fechaCompra?: string;

  @IsOptional()
  @IsString()
  precioUnitarioSinIGV?: string;
}

export class UpdateInventoryDto extends CreateInventoryDto {} 