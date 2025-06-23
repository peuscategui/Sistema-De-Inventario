import { PrismaClient } from '../../generated/prisma';

async function migrarDatos() {
  const prisma = new PrismaClient();
  
  try {
    // 1. Obtener todos los inventarios
    const inventarios = await prisma.inventory.findMany();
    console.log(`Encontrados ${inventarios.length} registros de inventario`);
    
    // 2. Obtener todos los empleados existentes
    const empleados = await prisma.empleado.findMany();
    console.log(`Encontrados ${empleados.length} empleados`);

    // 3. Obtener todas las clasificaciones existentes
    const clasificaciones = await prisma.clasificacion.findMany();
    console.log(`Encontradas ${clasificaciones.length} clasificaciones`);

    // 4. Crear mapas para búsqueda rápida
    const empleadosMap = new Map(
      empleados.map(emp => [
        JSON.stringify({
          cargo: emp.cargo?.trim(),
          gerencia: emp.gerencia?.trim()
        }),
        emp.id
      ])
    );

    const clasificacionesMap = new Map(
      clasificaciones.map(clas => [
        JSON.stringify({
          familia: clas.familia?.trim(),
          sub_familia: clas.sub_familia?.trim(),
          tipo_equipo: clas.tipo_equipo?.trim()
        }),
        clas.id
      ])
    );

    // 5. Actualizar los inventarios con sus relaciones específicas
    let actualizados = 0;
    let sinEmpleado = 0;
    let sinClasificacion = 0;

    for (const inv of inventarios) {
      try {
        const empleadoId = empleadosMap.get(JSON.stringify({
          cargo: inv.cargo?.trim(),
          gerencia: inv.gerencia?.trim()
        }));

        const clasificacionId = clasificacionesMap.get(JSON.stringify({
          familia: inv.familia?.trim(),
          sub_familia: inv.subFamilia?.trim(),
          tipo_equipo: inv.tipoEquipo?.trim()
        }));

        if (!empleadoId) {
          sinEmpleado++;
          console.log(`No se encontró empleado para: Cargo=${inv.cargo}, Gerencia=${inv.gerencia}`);
        }

        if (!clasificacionId) {
          sinClasificacion++;
          console.log(`No se encontró clasificación para: Familia=${inv.familia}, SubFamilia=${inv.subFamilia}, TipoEquipo=${inv.tipoEquipo}`);
        }

        if (empleadoId || clasificacionId) {
          await prisma.inventory.update({
            where: { id: inv.id },
            data: {
              empleadoId: empleadoId || undefined,
              clasificacionId: clasificacionId || undefined
            }
          });
          actualizados++;
        }
      } catch (error) {
        console.error(`Error actualizando inventario ${inv.id}:`, error);
      }
    }

    console.log(`
Resumen de la migración:
- ${actualizados} registros actualizados
- ${sinEmpleado} registros sin empleado correspondiente
- ${sinClasificacion} registros sin clasificación correspondiente
    `);
  } catch (error) {
    console.error('Error general:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrarDatos(); 