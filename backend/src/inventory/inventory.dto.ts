import { IsOptional } from 'class-validator';

export class CreateInventoryDto {
  @IsOptional()
  codigoEFC?: string;

  @IsOptional()
  tipoEquipo?: string;

  @IsOptional()
  familia?: string;

  @IsOptional()
  subFamilia?: string;

  @IsOptional()
  marca?: string;

  @IsOptional()
  modelo?: string;

  @IsOptional()
  descripcion?: string;

  @IsOptional()
  serie?: string;

  @IsOptional()
  procesador?: string;

  @IsOptional()
  anio?: number;

  @IsOptional()
  ram?: string;

  @IsOptional()
  discoDuro?: string;

  @IsOptional()
  sistemaOperativo?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  sede?: string;

  @IsOptional()
  estado?: string;

  @IsOptional()
  usuarios?: string;

  @IsOptional()
  cargo?: string;

  @IsOptional()
  gerencia?: string;

  @IsOptional()
  ubicacionEquipo?: string;

  @IsOptional()
  qUsuarios?: number;

  @IsOptional()
  condicion?: string;

  @IsOptional()
  motivoCompra?: string;

  @IsOptional()
  precioReposicion?: number;

  @IsOptional()
  proveedor?: string;

  @IsOptional()
  factura?: string;

  @IsOptional()
  anioCompra?: number;

  @IsOptional()
  vidaUtil?: string;

  @IsOptional()
  fecha_compra?: string;

  @IsOptional()
  precioUnitarioSinIgv?: string;

  @IsOptional()
  observaciones?: string;

  @IsOptional()
  precioReposicion2024?: number;
}

export class UpdateInventoryDto extends CreateInventoryDto {} 