import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';
import { CreateColaboradorDto } from './dto/create-colaborador.dto';
import { UpdateColaboradorDto } from './dto/update-colaborador.dto';

@Injectable()
export class ColaboradoresService {
  private prisma = new PrismaClient();
  private readonly logger = new Logger(ColaboradoresService.name);

  async findAll({ page = 1, pageSize = 10 }: { page: number; pageSize: number; }) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [data, totalCount] = await this.prisma.$transaction([
      this.prisma.empleado.findMany({
        skip,
        take,
        orderBy: {
          id: 'asc',
        }
      }),
      this.prisma.empleado.count(),
    ]);

    return {
      data,
      pagination: {
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  async findOne(id: number) {
    return this.prisma.empleado.findUnique({ where: { id } });
  }

  async create(data: CreateColaboradorDto) {
    this.logger.debug('Datos recibidos para crear colaborador:', JSON.stringify(data, null, 2));
    
    try {
      // Primero, obtener el máximo ID actual
      const maxIdResult = await this.prisma.$queryRaw<[{ next_id: number }]>`
        SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM empleado
      `;
      const nextId = maxIdResult[0].next_id;
      
      this.logger.debug('Próximo ID a utilizar:', nextId);
      
      // Crear el colaborador con el ID específico
      const result = await this.prisma.empleado.create({
        data: {
          id: nextId,
          nombre: data.nombre || '',
          cargo: data.cargo || null,
          gerencia: data.gerencia || null
        }
      });
      
      this.logger.debug('Colaborador creado exitosamente:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      this.logger.error('Error detallado al crear colaborador:', {
        error: error.message,
        code: error.code,
        meta: error.meta
      });
      throw error;
    }
  }

  async update(id: number, data: UpdateColaboradorDto) {
    return this.prisma.empleado.update({ where: { id }, data });
  }

  async delete(id: number) {
    return this.prisma.empleado.delete({ where: { id } });
  }
}
