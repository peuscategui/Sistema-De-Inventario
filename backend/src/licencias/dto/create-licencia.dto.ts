import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsDateString, 
  IsEnum, 
  IsInt, 
  IsArray, 
  IsDecimal,
  Length,
  Min,
  Max
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum TipoLicencia {
  Software = 'Software',
  Hardware = 'Hardware', 
  Servicio = 'Servicio',
  Subscripcion = 'Subscripcion'
}

export enum EstadoLicencia {
  Activa = 'Activa',
  Vencida = 'Vencida',
  PorVencer = 'PorVencer',
  Suspendida = 'Suspendida'
}

export class CreateLicenciaDto {
  @IsString()
  @Length(1, 50)
  codigoLicencia: string;

  @IsString()
  @Length(1, 200)
  nombre: string;

  @IsEnum(TipoLicencia)
  tipoLicencia: TipoLicencia;

  @IsString()
  @Length(1, 100)
  proveedor: string;

  @IsDateString()
  fechaCompra: string;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costo: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  moneda?: string = 'USD';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99999)
  cantidadUsuarios?: number = 1;

  @IsOptional()
  @IsEnum(EstadoLicencia)
  estado?: EstadoLicencia = EstadoLicencia.Activa;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  asignadoA?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentos?: string[];

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsInt()
  areaId?: number;

  @IsOptional()
  @IsInt()
  gerenciaId?: number;
} 