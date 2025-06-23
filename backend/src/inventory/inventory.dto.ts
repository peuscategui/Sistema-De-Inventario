import { IsString, IsInt, IsOptional, IsNotEmpty, IsBoolean, IsDateString, IsDecimal } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  @IsOptional()
  codigoEFC?: string;

  @IsString()
  @IsOptional()
  tipoEquipo?: string;

  @IsString()
  @IsOptional()
  familia?: string;

  @IsString()
  @IsOptional()
  subFamilia?: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsString()
  @IsOptional()
  modelo?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  serie?: string;

  @IsString()
  @IsOptional()
  procesador?: string;

  @IsInt()
  @IsOptional()
  anio?: number;

  @IsString()
  @IsOptional()
  ram?: string;

  @IsString()
  @IsOptional()
  discoDuro?: string;

  @IsString()
  @IsOptional()
  sistemaOperativo?: string;

  @IsString()
  @IsOptional()
  sede?: string;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  usuarios?: string;

  @IsString()
  @IsOptional()
  cargo?: string;

  @IsString()
  @IsOptional()
  gerencia?: string;

  @IsString()
  @IsOptional()
  ubicacionEquipo?: string;

  @IsInt()
  @IsOptional()
  qUsuarios?: number;

  @IsString()
  @IsOptional()
  condicion?: string;

  @IsString()
  @IsOptional()
  motivoCompra?: string;

  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  precioReposicion?: number;

  @IsString()
  @IsOptional()
  proveedor?: string;

  @IsString()
  @IsOptional()
  factura?: string;

  @IsInt()
  @IsOptional()
  anioCompra?: number;

  @IsString()
  @IsOptional()
  vidaUtil?: string;

  @IsInt()
  @IsOptional()
  fecha_compra?: number;

  @IsString()
  @IsOptional()
  precioUnitarioSinIgv?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  precioReposicion2024?: number;
}

export class UpdateInventoryDto extends CreateInventoryDto {} 