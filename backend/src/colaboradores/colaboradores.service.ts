import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '../../generated/prisma';
import { CreateColaboradorDto } from './dto/create-colaborador.dto';
import { UpdateColaboradorDto } from './dto/update-colaborador.dto';
import { PrismaService } from '../prisma.service';

interface FindAllParams {
  page: number;
  pageSize: number;
  filters?: {
    nombre?: string;
    cargo?: string;
    gerencia?: string;
  };
}

@Injectable()
export class ColaboradoresService {
  private readonly logger = new Logger(ColaboradoresService.name);

  constructor(private prisma: PrismaService) {}

  async findAll({ page = 1, pageSize = 10, filters = {} }: FindAllParams) {
    // Si pageSize es muy grande, devolver todos los registros sin paginación
    if (pageSize > 500) {
      const data = await this.prisma.empleado.findMany({
        orderBy: {
          nombre: 'asc', // Ordenar alfabéticamente por nombre
        }
      });
      return {
        data,
        pagination: {
          totalCount: data.length,
          page: 1,
          pageSize: data.length,
          totalPages: 1,
        },
      };
    }
    
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Construir el objeto where basado en los filtros
    const where: Prisma.empleadoWhereInput = {
      AND: [
        ...filters.nombre ? [{
          nombre: {
            contains: filters.nombre,
            mode: Prisma.QueryMode.insensitive
          }
        }] : [],
        ...filters.cargo ? [{
          cargo: {
            contains: filters.cargo,
            mode: Prisma.QueryMode.insensitive
          }
        }] : [],
        ...filters.gerencia ? [{
          gerencia: {
            contains: filters.gerencia,
            mode: Prisma.QueryMode.insensitive
          }
        }] : []
      ]
    };

    const [data, totalCount] = await this.prisma.$transaction([
      this.prisma.empleado.findMany({
        where,
        skip,
        take,
        orderBy: {
          nombre: 'asc', // Ordenar alfabéticamente por nombre
        }
      }),
      this.prisma.empleado.count({ where }),
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

  async createBatch(data: CreateColaboradorDto[]) {
    this.logger.debug('Iniciando importación masiva de colaboradores:', data.length);
    
    try {
      const results = [];
      
      for (const colaboradorData of data) {
        try {
          // Obtener el próximo ID disponible
          const maxIdResult = await this.prisma.$queryRaw<[{ next_id: number }]>`
            SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM empleado
          `;
          const nextId = maxIdResult[0].next_id;
          
          // Crear el colaborador
          const result = await this.prisma.empleado.create({
            data: {
              id: nextId,
              nombre: colaboradorData.nombre || '',
              cargo: colaboradorData.cargo || null,
              gerencia: colaboradorData.gerencia || null
            }
          });
          
          results.push(result);
        } catch (error) {
          this.logger.error(`Error al crear colaborador ${colaboradorData.nombre}:`, error);
          throw new Error(`Error al crear colaborador ${colaboradorData.nombre}: ${error.message}`);
        }
      }
      
      this.logger.debug('Importación masiva completada exitosamente:', results.length);
      return {
        message: `Se importaron ${results.length} colaboradores exitosamente`,
        data: results
      };
    } catch (error) {
      this.logger.error('Error en importación masiva:', error);
      throw error;
    }
  }
}
