import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getDashboard() {
    try {
      // Total de equipos en inventario
      const totalEquipos = await this.prisma.inventory.count();

      // Total de equipos en buen estado (OPERATIVO)
      const equiposBuenEstado = await this.prisma.inventory.count({
        where: {
          estado: 'OPERATIVO'
        }
      });

      // Total de equipos obsoletos
      const equiposObsoletos = await this.prisma.inventory.count({
        where: {
          estado: 'OBSOLETO'
        }
      });

      // Porcentaje de equipos en buen estado
      const porcentajeBuenEstado = totalEquipos > 0 ? Math.round((equiposBuenEstado / totalEquipos) * 100) : 0;

      // Familia más común
      const familiaMasComun = await this.prisma.inventory.groupBy({
        by: ['clasificacionId'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 1
      });

      // Obtener el nombre de la clasificación más común
      let familiaMasComunNombre = 'N/A';
      if (familiaMasComun.length > 0) {
        const clasificacion = await this.prisma.clasificacion.findUnique({
          where: { id: familiaMasComun[0].clasificacionId }
        });
        familiaMasComunNombre = clasificacion?.nombre || 'N/A';
      }

      // Total de bajas (equipos con estado BAJA)
      const totalBajas = await this.prisma.inventory.count({
        where: {
          estado: 'BAJA'
        }
      });

      return {
        totalEquipos,
        porcentajeBuenEstado,
        equiposObsoletos,
        totalBajas,
        familiaMasComun: {
          familia: familiaMasComunNombre,
          _count: { id: familiaMasComun.length > 0 ? familiaMasComun[0]._count.id : 0 }
        }
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del dashboard:', error);
      return {
        totalEquipos: 0,
        porcentajeBuenEstado: 0,
        equiposObsoletos: 0,
        totalBajas: 0,
        familiaMasComun: {
          familia: 'N/A',
          _count: { id: 0 }
        }
      };
    }
  }

  @Get('distribucion-familia')
  async getDistribucionFamilia() {
    try {
      // Obtener distribución por clasificación
      const distribucion = await this.prisma.inventory.groupBy({
        by: ['clasificacionId'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      });

      // Obtener nombres de las clasificaciones
      const clasificaciones = await this.prisma.clasificacion.findMany({
        select: {
          id: true,
          nombre: true
        }
      });

      // Mapear los resultados con los nombres de las clasificaciones
      const resultado = distribucion.map(item => {
        const clasificacion = clasificaciones.find(c => c.id === item.clasificacionId);
        return {
          familia: clasificacion?.nombre || 'Sin clasificar',
          _count: { id: item._count.id }
        };
      });

      return resultado;
    } catch (error) {
      console.error('Error obteniendo distribución por familia:', error);
      return [];
    }
  }
} 