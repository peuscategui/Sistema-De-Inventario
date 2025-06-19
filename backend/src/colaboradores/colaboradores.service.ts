import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class ColaboradoresService {
  private prisma = new PrismaClient();

  async findAll() {
    return this.prisma.empleado.findMany();
  }

  async findOne(id: number) {
    return this.prisma.empleado.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.empleado.create({ data });
  }

  async update(id: number, data: any) {
    return this.prisma.empleado.update({ where: { id }, data });
  }

  async delete(id: number) {
    return this.prisma.empleado.delete({ where: { id } });
  }
}
