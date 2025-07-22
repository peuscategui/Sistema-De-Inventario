import { PartialType } from '@nestjs/mapped-types';
import { CreateLicenciaDto } from './create-licencia.dto';

export class UpdateLicenciaDto extends PartialType(CreateLicenciaDto) {} 