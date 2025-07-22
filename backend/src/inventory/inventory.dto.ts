import { IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateInventoryDto {
  @IsOptional()
  codigoEFC?: string;

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
  estado?: string;

  @IsOptional()
  ubicacionEquipo?: string;

  @IsOptional()
  qUsuarios?: number;

  @IsOptional()
  condicion?: string;

  @IsOptional()
  @IsBoolean()
  repotenciadas?: boolean;

  @IsOptional()
  clasificacionObsolescencia?: string;

  @IsOptional()
  clasificacionRepotenciadas?: string;

  @IsOptional()
  motivoCompra?: string;

  @IsOptional()
  proveedor?: string;

  @IsOptional()
  factura?: string;

  @IsOptional()
  anioCompra?: number;

  @IsOptional()
  fecha_compra?: string;

  @IsOptional()
  precioUnitarioSinIgv?: string;

  @IsOptional()
  observaciones?: string;

  // Campos de baja - CORREGIDO: agregar campos de baja
  @IsOptional()
  fecha_baja?: string;

  @IsOptional()
  motivo_baja?: string;

  // Relaciones - CORREGIDO: opcionales como en el schema
  @IsOptional()
  @IsInt()
  articuloId?: number;

  @IsOptional()
  @IsInt()
  clasificacionId?: number;

  @IsOptional()
  @IsInt()
  empleadoId?: number;
}

export class UpdateInventoryDto extends CreateInventoryDto {} 