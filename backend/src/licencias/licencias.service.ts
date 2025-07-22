import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateLicenciaDto } from './dto/create-licencia.dto';
import { UpdateLicenciaDto } from './dto/update-licencia.dto';

@Injectable()
export class LicenciasService {
  constructor(private prisma: PrismaService) {}

  async findAll(options?: {
    page?: number;
    pageSize?: number;
    filters?: {
      nombre?: string;
      codigoLicencia?: string;
      tipoLicencia?: string;
      estado?: string;
      proveedor?: string;
      areaId?: number;
      gerenciaId?: number;
    };
  }) {
    const { page = 1, pageSize = 10, filters = {} } = options || {};
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (filters.nombre) {
      where.nombre = { contains: filters.nombre, mode: 'insensitive' };
    }
    if (filters.codigoLicencia) {
      where.codigoLicencia = { contains: filters.codigoLicencia, mode: 'insensitive' };
    }
    if (filters.proveedor) {
      where.proveedor = { contains: filters.proveedor, mode: 'insensitive' };
    }
    if (filters.tipoLicencia) {
      where.tipoLicencia = filters.tipoLicencia;
    }
    if (filters.estado) {
      where.estado = filters.estado;
    }
    if (filters.areaId) {
      where.areaId = filters.areaId;
    }
    if (filters.gerenciaId) {
      where.gerenciaId = filters.gerenciaId;
    }

    const [data, total] = await Promise.all([
      this.prisma.licencia.findMany({
        where,
        include: {
          area: { select: { id: true, nombre: true } },
          gerencia: { select: { id: true, nombre: true } },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.licencia.count({ where }),
    ]);

    return {
      data,
      pagination: {
        totalCount: total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        pageSize,
      },
    };
  }

  async findOne(id: number) {
    const licencia = await this.prisma.licencia.findUnique({
      where: { id },
      include: {
        area: { select: { id: true, nombre: true } },
        gerencia: { select: { id: true, nombre: true } },
      },
    });

    if (!licencia) {
      throw new NotFoundException(`Licencia con ID ${id} no encontrada`);
    }

    return licencia;
  }

  async create(createLicenciaDto: CreateLicenciaDto) {
    try {
      const licencia = await this.prisma.licencia.create({
        data: {
          ...createLicenciaDto,
          fechaCompra: new Date(createLicenciaDto.fechaCompra),
          fechaVencimiento: createLicenciaDto.fechaVencimiento 
            ? new Date(createLicenciaDto.fechaVencimiento) 
            : null,
        },
        include: {
          area: { select: { id: true, nombre: true } },
          gerencia: { select: { id: true, nombre: true } },
        },
      });

      return licencia;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe una licencia con ese código');
      }
      throw error;
    }
  }

  async update(id: number, updateLicenciaDto: UpdateLicenciaDto) {
    try {
      await this.findOne(id);

      const updateData: any = { ...updateLicenciaDto };
      
      if (updateLicenciaDto.fechaCompra) {
        updateData.fechaCompra = new Date(updateLicenciaDto.fechaCompra);
      }
      
      if (updateLicenciaDto.fechaVencimiento) {
        updateData.fechaVencimiento = new Date(updateLicenciaDto.fechaVencimiento);
      }

      const licencia = await this.prisma.licencia.update({
        where: { id },
        data: updateData,
        include: {
          area: { select: { id: true, nombre: true } },
          gerencia: { select: { id: true, nombre: true } },
        },
      });

      return licencia;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe una licencia con ese código');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.licencia.delete({ where: { id } });
    return { message: 'Licencia eliminada correctamente' };
  }

  async getDashboardStats() {
    const [totalLicencias, licenciasActivas, licenciasVencidas, costoTotal] = await Promise.all([
      this.prisma.licencia.count(),
      this.prisma.licencia.count({ where: { estado: 'Activa' } }),
      this.prisma.licencia.count({ where: { estado: 'Vencida' } }),
      this.prisma.licencia.aggregate({ _sum: { costo: true } }),
    ]);

    return {
      total: totalLicencias,
      activas: licenciasActivas,
      vencidas: licenciasVencidas,
      costoTotal: costoTotal._sum.costo || 0,
    };
  }

  // MÉTODOS PARA DASHBOARD Y ALERTAS

  async getAlertas(dias: number = 30) {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    const alertas = await this.prisma.licencia.findMany({
      where: {
        fechaVencimiento: {
          lte: fechaLimite,
          gte: new Date(),
        },
        estado: { not: 'Vencida' },
      },
      include: {
        area: { select: { nombre: true } },
        gerencia: { select: { nombre: true } },
      },
      orderBy: { fechaVencimiento: 'asc' },
    });

    return alertas.map(licencia => {
      const diasParaVencer = Math.ceil(
        (licencia.fechaVencimiento!.getTime() - Date.now()) / (1000 * 3600 * 24)
      );
      
      let tipoAlerta: 'critica' | 'alta' | 'media' = 'media';
      if (diasParaVencer <= 7) tipoAlerta = 'critica';
      else if (diasParaVencer <= 15) tipoAlerta = 'alta';

      return {
        ...licencia,
        diasParaVencer,
        tipoAlerta,
      };
    });
  }

  async updateEstadosAutomatico() {
    const ahora = new Date();
    
    // Marcar como vencidas
    await this.prisma.licencia.updateMany({
      where: {
        fechaVencimiento: { lt: ahora },
        estado: { not: 'Vencida' },
      },
      data: { estado: 'Vencida' },
    });

    // Marcar como próximas a vencer
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 30);

    await this.prisma.licencia.updateMany({
      where: {
        fechaVencimiento: {
          gte: ahora,
          lte: fechaLimite,
        },
        estado: 'Activa',
      },
      data: { estado: 'PorVencer' },
    });

    return { message: 'Estados actualizados correctamente' };
  }

  // Métodos para obtener datos para dropdowns
  async getProveedores() {
    const proveedores = await this.prisma.licencia.groupBy({
      by: ['proveedor'],
      _count: { _all: true },
      orderBy: { proveedor: 'asc' },
    });

    return proveedores.map(p => ({
      nombre: p.proveedor,
      cantidad: p._count._all,
    }));
  }

  async getTiposLicencia() {
    return [
      { value: 'Software', label: 'Software' },
      { value: 'Hardware', label: 'Hardware' },
      { value: 'Servicio', label: 'Servicio' },
      { value: 'Subscripcion', label: 'Subscripción' },
    ];
  }

  async getEstados() {
    return [
      { value: 'Activa', label: 'Activa' },
      { value: 'Vencida', label: 'Vencida' },
      { value: 'PorVencer', label: 'Por Vencer' },
      { value: 'Suspendida', label: 'Suspendida' },
    ];
  }
} 