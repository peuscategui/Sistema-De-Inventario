import { IsString, IsInt, IsOptional, IsNotEmpty, IsBoolean, IsDateString, IsDecimal } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  @IsNotEmpty()
  codigoEFC: string;

  @IsString()
  @IsNotEmpty()
  tipoEquipo: string;

  @IsString()
  @IsNotEmpty()
  familia: string;

  @IsString()
  @IsOptional()
  subFamilia?: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsString()
  @IsNotEmpty()
  modelo: string;

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
  @IsNotEmpty()
  sede: string;

  @IsString()
  @IsNotEmpty()
  estado: string;

  @IsString()
  @IsOptional()
  usuarios?: string;

  @IsString()
  @IsOptional()
  cargo?: string;

  @IsString()
  @IsNotEmpty()
  gerencia: string;

  @IsString()
  @IsNotEmpty()
  ubicacionEquipo: string;

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