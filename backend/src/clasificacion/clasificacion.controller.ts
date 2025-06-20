import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ClasificacionService } from './clasificacion.service';

@Controller('clasificacion')
export class ClasificacionController {
  constructor(private readonly clasificacionService: ClasificacionService) {}

  @Get()
  findAll() {
    return this.clasificacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clasificacionService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: any) {
    return this.clasificacionService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.clasificacionService.update(Number(id), data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.clasificacionService.delete(Number(id));
  }
}
