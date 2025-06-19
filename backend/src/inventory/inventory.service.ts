import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class InventoryService {
  private prisma = new PrismaClient();

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
