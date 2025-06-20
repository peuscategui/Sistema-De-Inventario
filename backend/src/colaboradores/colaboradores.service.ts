import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ColaboradoresService {
  constructor(private prisma: PrismaService) {}

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
