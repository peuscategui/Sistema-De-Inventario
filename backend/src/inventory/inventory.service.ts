import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.inventory.findMany();
  }

  async findOne(id: number) {
    return this.prisma.inventory.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.inventory.create({ data });
  }

  async update(id: number, data: any) {
    return this.prisma.inventory.update({ where: { id }, data });
  }

  async delete(id: number) {
    return this.prisma.inventory.delete({ where: { id } });
  }
}
