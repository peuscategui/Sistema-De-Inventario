import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class ClasificacionService {
  private prisma = new PrismaClient();

  async findAll() {
    return this.prisma.clasificacion.findMany();
  }

  async findOne(id: number) {
    return this.prisma.clasificacion.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.clasificacion.create({ data });
  }

  async update(id: number, data: any) {
    return this.prisma.clasificacion.update({ where: { id }, data });
  }

  async delete(id: number) {
    return this.prisma.clasificacion.delete({ where: { id } });
  }
}
