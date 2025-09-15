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
          condicion: 'OPERATIVO'
        }
      });

      // Total de equipos obsoletos (por condición)
      const equiposObsoletos = await this.prisma.inventory.count({
        where: {
          condicion: 'OBSOLETO'
        }
      });

      // Porcentaje de equipos en buen estado
      const porcentajeBuenEstado = totalEquipos > 0 ? Math.round((equiposBuenEstado / totalEquipos) * 100) : 0;

      // Familia más común - CORREGIDO: Sumar todas las clasificaciones de la misma familia
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
          familia: true
        }
      });

      // Agrupar por familia (sumando los conteos de las diferentes sub-familias)
      const familiaCounts = new Map();
      
      distribucion.forEach(item => {
        const clasificacion = clasificaciones.find(c => c.id === item.clasificacionId);
        const familia = clasificacion?.familia || 'Sin clasificar';
        
        if (familiaCounts.has(familia)) {
          familiaCounts.set(familia, familiaCounts.get(familia) + item._count.id);
        } else {
          familiaCounts.set(familia, item._count.id);
        }
      });

      // Encontrar la familia con más equipos
      let familiaMasComunNombre = 'N/A';
      let familiaMasComunCount = 0;
      
      for (const [familia, count] of familiaCounts.entries()) {
        if (count > familiaMasComunCount) {
          familiaMasComunNombre = familia;
          familiaMasComunCount = count;
        }
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
          _count: { id: familiaMasComunCount }
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
      // Obtener distribución agrupando directamente por familia desde la tabla clasificacion
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
          familia: true
        }
      });

      // Agrupar por familia (sumando los conteos de las diferentes sub-familias)
      const familiaCounts = new Map();
      
      distribucion.forEach(item => {
        const clasificacion = clasificaciones.find(c => c.id === item.clasificacionId);
        const familia = clasificacion?.familia || 'Sin clasificar';
        
        if (familiaCounts.has(familia)) {
          familiaCounts.set(familia, familiaCounts.get(familia) + item._count.id);
        } else {
          familiaCounts.set(familia, item._count.id);
        }
      });

      // Convertir a array y ordenar por cantidad
      const resultado = Array.from(familiaCounts.entries())
        .map(([familia, count]) => ({
          familia,
          _count: { id: count }
        }))
        .sort((a, b) => b._count.id - a._count.id);

      return resultado;
    } catch (error) {
      console.error('Error obteniendo distribución por familia:', error);
      return [];
    }
  }

  @Get('analisis-financiero')
  async getAnalisisFinanciero() {
    try {
      // Obtener datos de inventario con clasificaciones
      const inventarioConClasificacion = await this.prisma.inventory.findMany({
        where: {
          estado: {
            not: 'BAJA' // Excluir equipos dados de baja
          }
        },
        include: {
          clasificacion: {
            select: {
              familia: true,
              sub_familia: true,
              valor_reposicion: true,
              vida_util: true
            }
          }
        }
      });

      // Agrupar por familia y subfamilia
      const analisisPorFamilia = new Map();
      const analisisPorSubfamilia = new Map();

      inventarioConClasificacion.forEach(item => {
        const clasificacion = item.clasificacion;
        if (!clasificacion) return;

        const familia = clasificacion.familia;
        const subfamilia = clasificacion.sub_familia;
        const valorReposicion = parseFloat(clasificacion.valor_reposicion?.toString() || '0') || 0;
        const vidaUtil = parseInt(clasificacion.vida_util || '5') || 5;

        // Agrupar por familia
        if (!analisisPorFamilia.has(familia)) {
          analisisPorFamilia.set(familia, {
            familia,
            cantidad: 0,
            valorTotalReposicion: 0,
            valorPromedioReposicion: 0,
            vidaUtilPromedio: 0,
            subfamilias: new Map()
          });
        }

        const familiaData = analisisPorFamilia.get(familia);
        familiaData.cantidad += 1;
        familiaData.valorTotalReposicion += valorReposicion;

        // Agrupar por subfamilia
        const subfamiliaKey = `${familia} - ${subfamilia}`;
        if (!analisisPorSubfamilia.has(subfamiliaKey)) {
          analisisPorSubfamilia.set(subfamiliaKey, {
            familia,
            subfamilia,
            cantidad: 0,
            valorTotalReposicion: 0,
            valorPromedioReposicion: 0,
            vidaUtil: vidaUtil
          });
        }

        const subfamiliaData = analisisPorSubfamilia.get(subfamiliaKey);
        subfamiliaData.cantidad += 1;
        subfamiliaData.valorTotalReposicion += valorReposicion;

        // Agregar a subfamilias de la familia
        if (!familiaData.subfamilias.has(subfamilia)) {
          familiaData.subfamilias.set(subfamilia, {
            subfamilia,
            cantidad: 0,
            valorTotalReposicion: 0,
            valorPromedioReposicion: 0,
            vidaUtil: vidaUtil
          });
        }

        const subfamiliaEnFamilia = familiaData.subfamilias.get(subfamilia);
        subfamiliaEnFamilia.cantidad += 1;
        subfamiliaEnFamilia.valorTotalReposicion += valorReposicion;
      });

      // Calcular promedios y convertir a arrays
      const familiasArray = Array.from(analisisPorFamilia.values()).map(familia => {
        familia.valorPromedioReposicion = familia.cantidad > 0 ? 
          Math.round(familia.valorTotalReposicion / familia.cantidad) : 0;
        
        // Calcular vida útil promedio
        const subfamiliasArray = Array.from(familia.subfamilias.values()) as any[];
        familia.vidaUtilPromedio = subfamiliasArray.length > 0 ? 
          Math.round(subfamiliasArray.reduce((sum: number, sub: any) => sum + sub.vidaUtil, 0) / subfamiliasArray.length) : 5;

        // Convertir subfamilias a array
        familia.subfamilias = Array.from(familia.subfamilias.values()).map((sub: any) => ({
          ...sub,
          valorPromedioReposicion: sub.cantidad > 0 ? 
            Math.round(sub.valorTotalReposicion / sub.cantidad) : 0
        }));

        return familia;
      }).sort((a, b) => b.valorTotalReposicion - a.valorTotalReposicion);

      const subfamiliasArray = Array.from(analisisPorSubfamilia.values()).map((subfamilia: any) => ({
        ...subfamilia,
        valorPromedioReposicion: subfamilia.cantidad > 0 ? 
          Math.round(subfamilia.valorTotalReposicion / subfamilia.cantidad) : 0
      })).sort((a: any, b: any) => b.valorTotalReposicion - a.valorTotalReposicion);

      // Calcular totales generales
      const totalEquipos = familiasArray.reduce((sum, f) => sum + f.cantidad, 0);
      const valorTotalRenovacion = familiasArray.reduce((sum, f) => sum + f.valorTotalReposicion, 0);

      return {
        resumen: {
          totalEquipos,
          valorTotalRenovacion,
          valorPromedioPorEquipo: totalEquipos > 0 ? Math.round(valorTotalRenovacion / totalEquipos) : 0
        },
        porFamilia: familiasArray,
        porSubfamilia: subfamiliasArray
      };
    } catch (error) {
      console.error('Error obteniendo análisis financiero:', error);
      return {
        resumen: { totalEquipos: 0, valorTotalRenovacion: 0, valorPromedioPorEquipo: 0 },
        porFamilia: [],
        porSubfamilia: []
      };
    }
  }
} 