import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalEquipos,
      equiposPorEstado,
      equiposObsoletos,
      familiaMasComun,
      valorTotal,
      top5Modelos
    ] = await Promise.all([
      // Total de equipos
      this.prisma.inventory.count(),
      
      // Equipos por estado
      this.prisma.inventory.groupBy({
        by: ['estado'],
        _count: {
          id: true
        }
      }),

      // Equipos obsoletos
      this.prisma.inventory.count({
        where: {
          condicion: {
            in: ['OBSOLETO', 'OBSOLETOS', 'OBSOLETA', 'OBSOLETAS']
          }
        }
      }),

      // Familia más común
      this.prisma.inventory.groupBy({
        by: ['familia'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 1
      }),

      // Valor total del inventario
      this.prisma.inventory.aggregate({
        _sum: {
          precioReposicion2024: true
        }
      }),

      // Top 5 modelos más comunes
      this.prisma.inventory.groupBy({
        by: ['modelo'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 5
      })
    ]);

    // Calcular el porcentaje de equipos en buen estado
    const equiposBuenEstado = equiposPorEstado.find(e => e.estado === 'BUENO');
    const porcentajeBuenEstado = equiposBuenEstado 
      ? Math.round((equiposBuenEstado._count.id / totalEquipos) * 100)
      : 0;

    return {
      totalEquipos,
      porcentajeBuenEstado,
      equiposObsoletos,
      familiaMasComun: familiaMasComun[0] || null,
      valorTotal: valorTotal._sum.precioReposicion2024 || 0,
      top5Modelos: top5Modelos.map(modelo => ({
        modelo: modelo.modelo,
        cantidad: modelo._count.id
      }))
    };
  }

  async getDistribucionPorFamilia() {
    return this.prisma.inventory.groupBy({
      by: ['familia'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      having: {
        familia: {
          not: null
        }
      }
    });
  }

  async getEstadoPorGerencia() {
    const result = await this.prisma.inventory.groupBy({
      by: ['gerencia', 'estado'],
      _count: {
        id: true
      },
      orderBy: [
        {
          gerencia: 'asc'
        },
        {
          estado: 'asc'
        }
      ],
      having: {
        gerencia: {
          not: null
        }
      }
    });

    return result.filter(item => item.estado && item.gerencia);
  }
} 