import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto, UpdateInventoryDto } from './inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.inventoryService.findAll({ page, pageSize });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: CreateInventoryDto) {
    return this.inventoryService.create(data);
  }

  @Post('batch')
  batchCreate(@Body() data: CreateInventoryDto[]) {
    return this.inventoryService.batchCreate(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateInventoryDto) {
    return this.inventoryService.update(Number(id), data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.inventoryService.delete(Number(id));
  }
}
