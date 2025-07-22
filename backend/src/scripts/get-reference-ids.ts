import { PrismaService } from '../prisma.service';

async function getReferenceIds() {
  const prisma = new PrismaService();
  
  try {
    console.log('📋 Obteniendo IDs de referencia para CSV...\n');
    
    // Obtener clasificaciones
    console.log('🏷️  CLASIFICACIONES:');
    console.log('ID | Familia | Sub Familia | Tipo Equipo');
    console.log('---|---------|-------------|------------');
    
    const clasificaciones = await prisma.clasificacion.findMany({
      select: {
        id: true,
        familia: true,
        sub_familia: true,
        tipo_equipo: true
      },
      orderBy: { id: 'asc' }
    });
    
    clasificaciones.forEach(c => {
      console.log(`${c.id.toString().padEnd(2)} | ${(c.familia || '').padEnd(8)} | ${(c.sub_familia || '').padEnd(12)} | ${c.tipo_equipo || ''}`);
    });
    
    console.log(`\nTotal clasificaciones: ${clasificaciones.length}\n`);
    
    // Obtener empleados
    console.log('👥 EMPLEADOS (primeros 20):');
    console.log('ID | Nombre | Cargo | Gerencia');
    console.log('---|--------|-------|----------');
    
    const empleados = await prisma.empleado.findMany({
      select: {
        id: true,
        nombre: true,
        cargo: true,
        gerencia: true
      },
      orderBy: { id: 'asc' },
      take: 20  // Solo los primeros 20 para no saturar
    });
    
    empleados.forEach(e => {
      console.log(`${e.id.toString().padEnd(2)} | ${(e.nombre || '').padEnd(7)} | ${(e.cargo || '').padEnd(6)} | ${e.gerencia || ''}`);
    });
    
    console.log(`\nMostrando primeros 20 empleados de ${await prisma.empleado.count()} totales\n`);
    
    // Consejos
    console.log('💡 CONSEJOS PARA EL CSV:');
    console.log('• clasificacionId: Usa los IDs de la tabla CLASIFICACIONES');
    console.log('• empleadoId: Usa los IDs de la tabla EMPLEADOS');
    console.log('• Si no conoces el ID exacto, deja la columna vacía');
    console.log('• Para ver todos los empleados: SELECT id, nombre FROM empleado ORDER BY nombre;');
    console.log('• Para buscar empleado: SELECT id, nombre FROM empleado WHERE nombre ILIKE \'%NOMBRE%\';');
    
  } catch (error) {
    console.error('❌ Error obteniendo IDs de referencia:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  getReferenceIds();
}

export { getReferenceIds }; 