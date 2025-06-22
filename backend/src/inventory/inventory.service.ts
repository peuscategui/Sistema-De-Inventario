import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateInventoryDto } from './inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll({ page = 1, pageSize = 20 }) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [data, totalCount] = await this.prisma.$transaction([
      this.prisma.inventory.findMany({
        skip,
        take,
        include: {
          clasificacion: true,
          empleado: true,
        },
        orderBy: {
          id: 'asc',
        }
      }),
      this.prisma.inventory.count(),
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
    return this.prisma.inventory.findUnique({
      where: { id },
      include: {
        clasificacion: true,
        empleado: true,
      },
    });
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

  async batchCreate(data: any[]) {
    try {
      // Mapear los campos del Excel a los campos del modelo
      const mappedData = data.map(item => ({
        codigoEFC: item.codigoEFC || 'Por asignar',
        tipoEquipo: item.tipoEquipo,
        familia: item.familia,
        subFamilia: item.subFamilia,
        marca: item.marca,
        modelo: item.modelo,
        descripcion: item.descripcion,
        serie: item.serie ? String(item.serie) : null, // Convertir a string si existe
        procesador: item.procesador,
        anio: item.anio,
        ram: item.ram,
        discoDuro: item.dicoDuro || item.discoDuro, // Mapear dicoDuro a discoDuro
        sistemaOperativo: item.sistemaOperativo,
        sede: item.sede,
        estado: item.estado,
        usuarios: item.usuarios,
        cargo: item.cargo,
        gerencia: item.gerencia,
        ubicacionEquipo: item.ubicacionEquipo,
        qUsuarios: item.qUsuario || item.qUsuarios, // Mapear qUsuario a qUsuarios
        condicion: item.condicion,
        motivoCompra: item.motivoCompra,
        precioReposicion: item.precioReposicion,
        proveedor: item.proveedor,
        factura: item.factura,
        anioCompra: item.anioCompra,
        vidaUtil: item.vidaUtil,
        fecha_compra: item.fecha_compra,
        precioUnitarioSinIgv: item.precioUnitarioSinIgv,
        observaciones: item.observaciones ? String(item.observaciones) : null, // Convertir a string si existe
        precioReposicion2024: item.precioReposicion2024
      }));

      const result = await this.prisma.inventory.createMany({
        data: mappedData,
        skipDuplicates: true,
      });
      return result;
    } catch (e) {
      console.error('Error en batchCreate:', e);
      throw new Error('Error al insertar los datos en la base de datos.');
    }
  }
}
